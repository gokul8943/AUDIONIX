const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema({
    product :{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product',
    },
});

const wishlistSchema = new mongoose.Schema({
    user :{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    },
    date:{
        type : Date,
        default : Date.now,
    },
    items : [wishlistItemSchema],
});

module.exports = mongoose.model('Wishlist',wishlistSchema)

