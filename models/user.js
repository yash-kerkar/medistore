var mongoose = require('mongoose');
var passlocalmongoose = require('passport-local-mongoose');

var userSchema = new mongoose.Schema({
    username:String,
    session:String,
    password:String,
    cart:Array,
    order:Array
});

userSchema.plugin(passlocalmongoose);

module.exports = mongoose.model('user',userSchema);