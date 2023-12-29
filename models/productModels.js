const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({

  name:{
        type :String,
        required:true,
    },
    date:{
        type:String,
        default:Date.now(),
    },
    price:{
        type : Number,
        required:true,
    },
    discountPrice:{
         type:Number,
         required:true,
    },
    image:[{
        type:String,
        required:true,

    }],
    category:{
        type:String,
        required:true,
    },
    brand:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    color:{
        type:String,
        required:true,
    },
    is_wired:{
        type:Boolean,
        default:false,
    },
      
      type:{
        type:String,
        required:true,
      },
      driverUnits:{
        type:String,
        required:true,
      },
      noise:{
        type:Boolean,
        required:true,
      },      
      microPhone:{
        type:Boolean,
        required:true,
      },
       batteryCapacity:{
        type:String,
        required:true,
       },
    rating:{
        type:Number,
        default:0,
    },
    quantity:{
        type:Number,
        required:true,
    },
    is_listed:{
        type:Boolean,
        default:true,
    }


});

module.exports = mongoose.model("Product",productSchema);