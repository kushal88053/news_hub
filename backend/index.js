const axios = require("axios");

const cheerio = require("cheerio");

const fs = require("fs");



const url = "https://www.thehindu.com/latest-news/";

const fetchLatestNews = async () => {
    try {
        const response = await axios.get(url); // Await the promise here
        const html = response.data;
        const $ = cheerio.load(html);

        const ulElement = $('ul.timeline-with-img')
        fs.writeFileSync('li.html', ulElement.html());

        const newsItems = [] ;

        ulElement.find('li').each((index, element) => {

            const location = $(element).find('.label a').text().trim();
            const headline = $(element).find('h3.title a').text().trim();
            const articleLink = $(element).find('h3.title a').attr('href');
            const imageLink = $(element).find('.picture img').attr('src') || 'No image available';
            const publishedDate = $(element).find('.news-time').attr('data-published');

            newsItems.push({
                location,
                headline,
                articleLink,
                imageLink,
                publishedDate
            });
        });

          fs.writeFileSync('data1.json' , JSON.stringify(newsItems)); 

    } catch (error) {
        console.error("Error", error);
    }
};

fetchLatestNews();
