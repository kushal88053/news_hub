const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment-timezone'); // For handling timezones
const fs = require('fs');
const News = require('./models/GetNews');
const connectDB = require('./config/db');

connectDB();
let last = null;
const url = 'https://economictimes.indiatimes.com/news/latest-news';

function addISTOffset(date) {
    const offsetInMilliseconds = 5 * 60 * 60 * 1000 + 30 * 60 * 1000; // +5 hours and 30 minutes in milliseconds
    return new Date(date.getTime() + offsetInMilliseconds); // Add the offset to the date
}

function parseDateString(dateString) {
    try {
        const isISOFormat = moment(dateString, moment.ISO_8601, true).isValid();

        if (isISOFormat) {
            // Parse ISO date format as UTC and add IST offset
            const utcDate = moment.utc(dateString);
            const istDate = utcDate.add(5, 'hours').add(30, 'minutes'); // Add 5 hours and 30 minutes for IST
            return istDate.toDate(); // Return as a Date object for comparison
        } else {
            // Process non-ISO formats (e.g., "6 Sep, 2024 6:24 PM IST")
            const cleanedDateString = dateString.replace(/^Updated:\s*/, '').replace(/\s+IST$/, '').trim();
            const localDateObject = moment(cleanedDateString, 'D MMM, YYYY h:mm A'); // 12-hour format with AM/PM

            if (!localDateObject.isValid()) {
                console.log('Invalid date, returning current date and time');
                return last ? last : addISTOffset(new Date()); // Fallback to current date and time
            }

            const istDateObject = addISTOffset(localDateObject.toDate());
            last = istDateObject; // Store last valid date
            return istDateObject; // Return the date adjusted to IST
        }
    } catch (error) {
        console.error('Error parsing date string:', error);
        return last ? last : addISTOffset(new Date()); // Fallback to current date and time
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

        $('ul.data li').each((index, element) => {
            const headline = $(element).find('a').text().trim() || 'No title available';
            const articleLink = $(element).find('a').attr('href');
            const imageLink = $(element).find('.snaps img').attr('src') || 'No image available';
            const publishedDate = parseDateString($(element).find('.timestamp').attr('data-time'));
            const paragraph = $(element).find('p').text().trim();
            const fullArticleLink = articleLink ? `${articleLink}` : 'No link available';

            if (publishedDate > mostRecentDate) {
                newsItems.push({
                    headline,
                    articleLink: fullArticleLink,
                    imageLink,
                    publishedDate,
                    source: "66d9bd8e968ba3f4667688a7", // Your source ID
                    paragraph,
                    currentDateTime: new Date().toISOString()
                });
            }
        });

        // Sort the newsItems by publishedDate (latest first)
        newsItems.sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));

        console.log(newsItems);
        // Save the HTML content to a file
        fs.writeFileSync('theeconomictimes.html', $('ul.data').html());

        if (newsItems.length > 0) {
            const result = await News.insertMany(newsItems);
            console.log('Successfully inserted news items:');
            fs.writeFileSync('theeconomictimes.json', JSON.stringify(newsItems));
            console.log(result);
        } else {
            console.log('No new news items to insert.');
        }

        console.log(`Insertion timestamp: ${new Date().toISOString()}`);
    } catch (error) {
        console.error("Error fetching or processing news:", error);
    }
};

fetchLatestNews();
