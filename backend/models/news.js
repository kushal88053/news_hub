const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    location: String,
    headline: String,
    articleLink: String,
    imageLink: String,
    publishedDate: Date,
    source: String // To differentiate between news sources
});

const News = mongoose.model('News', newsSchema);

module.exports = News;
