const mongoose=require('mongoose')

const addressSchema = new mongoose.Schema({

    user:{
        type : String,
        required:true
    },
    name:{
        type:String,
        required:true
    },

    mobile:{
        type:String,
        required:true
    },

    pincode:{
        type:Number,
        required:true
    },

    district:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    city:{
        type:String,
        required:true
    },
    state:{
        type:String,
        required:true
    },
    addresstype:{
        type:Boolean,
        required:true
    },
    is_default:{
        type:Boolean,
        default:false
    }

})

module.exports = mongoose.model('Address',addressSchema)