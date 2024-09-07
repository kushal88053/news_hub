const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment-timezone'); // For date handling
const fs = require('fs');
const News = require('./models/GetNews');
const connectDB = require('./config/db');

connectDB();

let lastDate = null;
const url = 'https://www.hindustantimes.com/latest-news';

function addISTOffset(date = new Date()) {
    const offsetInMilliseconds = 5 * 60 * 60 * 1000 + 30 * 60 * 1000; // +5 hours and 30 minutes in milliseconds
    const istDate = new Date(date.getTime() + offsetInMilliseconds); // Add the offset to the current date
    console.log(istDate); // Output the adjusted date
    return istDate;
}

function parseDateString(dateString) {
    console.log(dateString);
    try {
        if (!dateString || dateString === 'No date available') {
            throw new Error('No valid date provided');
        }

        // Clean the date string if necessary
        const cleanedDateString = dateString.replace(/^Updated:\s*/, '').replace(/\s+IST$/, '').trim();

        let localDateObject = moment.tz(cleanedDateString, 'D MMM, YYYY h:mm:ss A', 'Asia/Kolkata'); // Parsing as IST (Asia/Kolkata)

        if (!localDateObject.isValid()) {
            console.log('Invalid date, returning current date and time');
            return lastDate ? lastDate : addISTOffset(); // Fallback to current date and time with IST offset
        }

        localDateObject = localDateObject.add(5, 'hours').add(30, 'minutes');
        lastDate = localDateObject ;
        console.log(localDateObject.toDate()); // Log the parsed date

        return localDateObject.toDate(); // Return the parsed date as a JS Date object
    } catch (error) {
        console.error('Error parsing date string:', error.message);
        return lastDate ? lastDate : addISTOffset(); // Fallback to current date and time with IST offset
    }
}


const fetchLatestNews = async () => {
    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        const newsItems = [];
        const source = "66db35ca968ba3f4667688bd"; // Source ID

        // Fetch the most recent news from the database
        const mostRecentNews = await News.findOne({ source }).sort({ publishedDate: -1 });
        const mostRecentDate = mostRecentNews ? new Date(mostRecentNews.publishedDate) : new Date(0);

        $('.cartHolder').each((index, element) => {
            // Extract headline, article link, and image link
            const headline = $(element).find('h3.hdg3 a').text().trim() || 'No title available';
            const articleLink = $(element).attr('data-weburl') || 'No link available';
            const imageLink = $(element).find('figure span a img').attr('data-src') ||
                $(element).find('img').attr('src') || 'No image available';

            // Extract and parse published date
            let publishedDate = $(element).attr('data-vars-story-time') ||
                $(element).find('.dateTime.secTime.ftldateTime').text().trim() ||
                'No date available';
            publishedDate = parseDateString(publishedDate);

            // Extract the paragraph or description
            const paragraph = $(element).find('h2.sortDec').text().trim() || 'No description available';

            // Push the news item to the array if it's newer than the most recent date
            if (publishedDate > mostRecentDate) {
                newsItems.push({
                    headline,
                    articleLink,
                    imageLink,
                    publishedDate,
                    paragraph,
                    source,
                    currentDateTime: new Date().toISOString()
                });
            }
        });


        // Sort the newsItems array by publishedDate in ascending order
        newsItems.sort((a, b) => new Date(a.publishedDate) - new Date(b.publishedDate));


        // Save the HTML content to a file (ensure the correct selector)
        if ($('.listingPage').length > 0) {
            fs.writeFileSync('hindustantimes.html', $('.listingPage').html());
        } else {
            console.log('No listingPage element found');
        }

        // Insert new news items into the database if there are any
        if (newsItems.length > 0) {
            console.log('Successfully inserted news items:');
            const result = await News.insertMany(newsItems);
            // console.log(result);
        } else {
            console.log('No new news items to insert.');
        }

        console.log(`Insertion timestamp: ${new Date().toISOString()}`);

    } catch (error) {
        console.error("Error fetching or processing news:", error);
    }
};

fetchLatestNews();
