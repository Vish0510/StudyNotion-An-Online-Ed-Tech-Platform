const mongoose = require('mongoose');

// Define Category Schema
const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    courses:{ 
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Course',
            },
        ],
        default: [],
    },
});

module.exports = mongoose.model('Category', categorySchema);