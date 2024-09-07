const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const moment = require("moment-timezone") ;
const News = require('./models/GetNews');
const connectDB = require('./config/db');

connectDB();

const url = "https://www.thehindu.com/latest-news/";

const fetchLatestNews = async () => {
    try {
        const response = await axios.get(url); // Await the promise here
        const html = response.data;
        const $ = cheerio.load(html);

        const ulElement = $('ul.timeline-with-img');
        fs.writeFileSync('thehindu.html', ulElement.html());

        const newsItems = [];
        const mostRecentNews = await News.findOne({
            source: "66d8648e968ba3f46676889f" // Filter by source ID
        }).sort({ publishedDate: -1 }); // Sort by publishedDate in descending order
        const mostRecentDate = mostRecentNews ? new Date(mostRecentNews.publishedDate) : new Date(0); // Fallback to epoch if no news

        ulElement.find('li').each((index, element) => {
            // console.log(element);
            const location = $(element).find('.label a').text().trim();
            const headline = $(element).find('h3.title a').text().trim();
            const articleLink = $(element).find('h3.title a').attr('href');
            const imageLink = $(element).find('.picture img').attr('src') || 'No image available';
            let publishedDate = new Date($(element).find('.news-time').attr('data-published'));
            const localDateObject = moment(publishedDate);
            publishedDate = localDateObject.add(5, 'hours').add(30, 'minutes').toDate();

            const currentDateTime = new Date().toISOString();

            if (publishedDate > mostRecentDate) {

                newsItems.push({
                    location,
                    headline,
                    articleLink,
                    imageLink,
                    publishedDate: publishedDate.toISOString(), // Ensure date is in ISO format
                    paragraph: '',
                    source: "66d8648e968ba3f46676889f",
                    currentDateTime // Add the current date and time

                });
            }
        });
        newsItems.sort((a, b) => new Date(a.publishedDate) - new Date(b.publishedDate));

        console.log(newsItems);
        if (newsItems.length > 0) {

            const result = await News.insertMany(newsItems);
            fs.writeFileSync('thehindhu.json', JSON.stringify(newsItems));

            console.log('Successfully inserted news items:');
         //   console.log(result);
        } else {
            console.log('No new news items to insert.');
        }
        console.log(`Insertion timestamp: ${new Date().toISOString()}`);



    } catch (error) {
        console.error("Error", error);
    }
};

fetchLatestNews();
