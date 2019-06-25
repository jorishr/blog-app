//  ============
//  SCHEMA SETUP FOR USER DATA
//  ============

const   mongoose = require('mongoose'),
        passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new mongoose.Schema({
    username: String,
    password: String
});

UserSchema.plugin(passportLocalMongoose);   //  password hashing and salting in dbs

//  MODEL
module.exports = mongoose.model('User', UserSchema); 


