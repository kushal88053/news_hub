const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const News = require('./models/news'); // Import the News model
const Newspaper = require('./models/newspapers'); // Import the News model

const cors = require('cors');
const app = express();

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.get('/', (req, res) => {
    res.send('Welcome to the News API!');
});

// Route to get all news items
app.get('/news', async (req, res) => {
    try {
        const { source, date } = req.query;

        console.log( { source, date });
        const query = {
            source: source,
            publishedDate: {
                $gte: new Date(date + 'T00:00:00.000Z'),
                $lt: new Date(date + 'T23:59:59.999Z')
            }
        };
        const newsItems = await News.find(query);
        res.json(newsItems);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});


app.get('/newspapers', async (req, res) => {
    try {
       
        const newsItems = await Newspaper.find();
        res.json(newsItems);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
