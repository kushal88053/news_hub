const mongoose = require('mongoose'); 

const newsSchema = new mongoose.Schema({
    location: String,
    headline: String,
    articleLink: String,
    imageLink: String,
    paragraph : String,
    publishedDate: Date,
    source: String ,
    createdAt: {
        type: Date,
        default: Date.now // Automatically set the current date and time when a document is created
    }
});

const news = mongoose.model('News',newsSchema) ;
module.exports = news;
