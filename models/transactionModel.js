const mongoose = require('mongoose');

const transationSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    amount : String,
    type: String,
    paymentMethod : String,
    objectId : String,
    date:{
        type:Date,
        default: Date.now,
    },
    description : String,
});

module.exports = mongoose.model('Transaction',transationSchema)