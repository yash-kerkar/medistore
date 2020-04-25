var mongoose = require('mongoose');

var productschema = new mongoose.Schema({
    title:String,
    image:String,
    price:Number,
    desc:String,
    comments:[
      {
        type:mongoose.Schema.Types.ObjectId,
        ref:'comment'
      }
    ]
});

module.exports = mongoose.model('product',productschema);