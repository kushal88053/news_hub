// scripts/seed.js
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const News = require('./models/news');

const newsData = [
    {
        headline: 'Breaking News: Example 1',
        location: 'Location 1',
        publishedDate: new Date(),
        imageLink: 'http://example.com/image1.jpg',
        articleLink: 'http://example.com/article1'
    },
    {
        headline: 'Breaking News: Example 2',
        location: 'Location 2',
        publishedDate: new Date(),
        imageLink: 'http://example.com/image2.jpg',
        articleLink: 'http://example.com/article2'
    }
];

const seedDB = async () => {
    await connectDB();
    await News.deleteMany({}); // Clear existing data
    await News.insertMany(newsData); // Insert test data
    console.log('Database seeded');
    mongoose.connection.close(); // Close the connection
};

seedDB();
