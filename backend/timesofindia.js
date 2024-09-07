const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment-timezone'); // For date handling
const fs = require('fs');
const News = require('./models/GetNews');
const connectDB = require('./config/db');

connectDB();
var lastDate = null;

const url = 'https://timesofindia.indiatimes.com/news';

var last = null;


function getCurrentISTDate() {
    // Get the current time in UTC
    const currentDate = new Date();

    // Calculate the IST offset (UTC +5:30)
    const istOffset = 5 * 60 * 60 * 1000 + 30 * 60 * 1000; // 5 hours 30 minutes in milliseconds

    // Create a new Date object adjusted for IST
    const istDate = new Date(currentDate.getTime() + istOffset);

    return istDate;
}

function addISTOffset(date) {
    const offsetInMilliseconds = 5 * 60 * 60 * 1000 + 30 * 60 * 1000; // +5 hours and 30 minutes in milliseconds
    const istDate = new Date(date.getTime() + offsetInMilliseconds); // Add the offset to the current date
    console.log(istDate); // Output the adjusted date
    return istDate;
}

const fetchLatestNews = async () => {
    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        const newsItems = [];
        const source = "66daba4e968ba3f4667688b8";
        // Fetch the most recent news from the database
        const mostRecentNews = await News.findOne({
            source, // Replace with your source ID
        }).sort({ publishedDate: -1 });

        const mostRecentDate = mostRecentNews ? new Date(mostRecentNews.publishedDate) : new Date(0); // Fallback to epoch if no news

        $('.iLNrO ul.HytnJ li').each((index, element) => {

            const headline = $(element).find('.UreF0 p.CRKrj').text().trim() || 'No title available';

            const articleLink = $(element).find('a').attr('href');

            const imageLink = $(element).find('img').attr('data-src') || 'No image available';

            const publishedDate = addISTOffset(new Date());

            const paragraph = $(element).find('.UreF0 p.W4Hjm').text().trim() || 'No paragraph available';

            const fullArticleLink = articleLink ? `${articleLink}` : 'No link available';

            if (publishedDate > mostRecentDate) {
                newsItems.push({
                    headline,
                    articleLink: fullArticleLink,
                    imageLink,
                    publishedDate,
                    source,
                    paragraph,
                    currentDateTime: new Date().toISOString()
                });
            }
        });


        newsItems.sort((a, b) => new Date(a.publishedDate) - new Date(b.publishedDate));
        //  console.log(newsItems);
        fs.writeFileSync('timesofindia.html', $('.iLNrO ul.HytnJ').html());

        if (newsItems.length > 0) {
            console.log('Successfully inserted news items:');

            const result = await News.insertMany(newsItems);
            fs.writeFileSync('timesofindia.json', JSON.stringify(newsItems));

        } else {
            console.log('No new news items to insert.');
        }

        console.log(`Insertion timestamp: ${new Date().toISOString()}`);

    } catch (error) {
        console.error("Error fetching or processing news:", error);
    }
};

fetchLatestNews();
