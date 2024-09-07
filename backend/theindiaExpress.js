const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment-timezone'); // Make sure to include moment-timezone if not already installed
const fs = require('fs');
const News = require('./models/GetNews');
const connectDB = require('./config/db');

connectDB();

const url = 'https://indianexpress.com/latest-news/';

var last = null;
function addISTOffset(date) {
    const offsetInMilliseconds = 5 * 60 * 60 * 1000 + 30 * 60 * 1000; // +5 hours and 30 minutes in milliseconds
    const istDate = new Date(date.getTime() + offsetInMilliseconds); // Add the offset to the current date
    console.log(istDate); // Output the adjusted date
    return istDate;
}

function parseDateString(dateString) {
    try {
        // Remove the prefix "Updated: " and the suffix " IST"
        const cleanedDateString = dateString.replace(/^Updated:\s*/, '').replace(/\s+IST$/, '').trim();

        // Parse the cleaned date string with local time
        let localDateObject = moment(cleanedDateString, 'MMMM D, YYYY HH:mm');

        // Check if the date is valid
        if (!localDateObject.isValid()) {
            console.log('Invalid date, returning current date and time');
            return last ? last : addISTOffset(new Date()); // If invalid, return the current date + 5:30 (IST)
        }

        // Add +5 hours and 30 minutes (IST offset)
        localDateObject = localDateObject.add(5, 'hours').add(30, 'minutes');

        const istDateObject = localDateObject.toDate();
        console.log(istDateObject); // Output the IST date in UTC format

        return istDateObject; // Return the IST-adjusted date object
    } catch (error) {
        console.error("Error parsing date string:", error);
        return last ? last : addISTOffset(new Date()); // Fallback to current date + IST offset
    }
}

const fetchLatestNews = async () => {
    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        const newsItems = [];

        // Fetch the most recent news from the database
        const mostRecentNews = await News.findOne({
            source: "66d9bd8e968ba3f4667688a7" // Filter by source ID
        }).sort({ publishedDate: -1 }); // Sort by publishedDate in descending order
        const mostRecentDate = mostRecentNews ? new Date(mostRecentNews.publishedDate) : new Date(0); // Fallback to epoch if no news

        // Iterate over each article
        $('.articles').each((index, element) => {
            const headline = $(element).find('.snaps a').attr('title') || 'No title available';
            const articleLink = $(element).find('.snaps a').attr('href');
            const imageLink = $(element).find('.snaps img').attr('src') || 'No image available';
            const publishedDate = parseDateString($(element).find('.img-context .date').text().trim());
            const paragraph = $(element).find('.img-context p').text().trim(); // Extract paragraph text
            const fullArticleLink = articleLink ? `https://indianexpress.com${articleLink}` : 'No link available';

            if (publishedDate > mostRecentDate) {
                newsItems.push({
                    headline,
                    articleLink: fullArticleLink,
                    imageLink,
                    publishedDate,
                    source: "66d9bd8e968ba3f4667688a7",
                    paragraph,
                    currentDateTime: new Date().toISOString()
                });
            }
        });

        newsItems.sort((a, b) => new Date(a.publishedDate) - new Date(b.publishedDate));

        // console.log(newsItems);
        // Save the HTML content to a file
        fs.writeFileSync('theindianexpress.html', $('.articles .snaps').html());
        //  console.log(newsItems);
        if (newsItems.length > 0) {
            // Insert new news items into the database
            const result = await News.insertMany(newsItems);
            fs.writeFileSync('theindianExpress.json', JSON.stringify(newsItems));

            console.log('Successfully inserted news items:');
            //console.log(result);
        } else {
            console.log('No new news items to insert.');
        }
        console.log(`Insertion timestamp: ${new Date().toISOString()}`);

    } catch (error) {
        console.error("Error fetching or processing news:", error);
    }
};

fetchLatestNews();
