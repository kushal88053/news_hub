const mongoose = require('mongoose');

// Define the schema for newspapers
const newspaperSchema = new mongoose.Schema({
    
    name: {
        type: String,
        required: true
    },
    publicationDate: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now // Automatically set the current date and time when a document is created
    }
});

// Create a model based on the schema
const Newspaper = mongoose.model('Newspaper', newspaperSchema);

module.exports = Newspaper;
