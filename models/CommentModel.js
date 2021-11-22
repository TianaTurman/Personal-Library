const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    text:{
        type: String,
        required: true

    },
    reference:{
        type: String,
        required: true
    }
})

const CommentModel = mongoose.model('comment',CommentSchema);
module.exports = CommentModel