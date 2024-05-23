const mongoose = require('mongoose'); 
var plm=require('passport-local-mongoose');
mongoose.connect('mongodb://localhost:27017/instaclone');
var UserSchema = new mongoose.Schema({

  username: String,
  email: String,
  name: String,
  password: String,
  bio: String,
  profilepic: {
    type: String,
    default:'default.jpg'
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  followings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'post'
  }],
  story: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'story'
  }],
  messages: {
    type:Array,
  },
  
});

UserSchema.plugin(plm);
module.exports = mongoose.model('User', UserSchema);
