const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/database');
const UserProfileSchema = mongoose.Schema({
    name: String,
    empid:String,
    profile: [{
        Area: String,
        Technology: String,
        ProjectPhase: String,
        Jira: String,
        Project: String,
        weekenddate: String,
        weekstartdate: String,
        effort:String
    }]
});


const UserProfile = module.exports = mongoose.model('UserProfile', UserProfileSchema);

module.exports.addProfile = function (newUserProfile, callback) {

    newUserProfile.save(callback);

}

module.exports.updateProfile = function (data, updateddata, callback) {
    UserProfile.findByIdAndUpdate(data._id,updateddata, { new: true }, callback);

}

module.exports.getUserProfileByArea = function (area,strdate,enddate,callback) {
    const query = {
        'profile.Area': area, 'profile.weekstartdate': { $gte: strdate, $lte: enddate }   
    };    
    UserProfile.find(query, callback);
}

module.exports.getUserProfileByWeekEndDate = function (weekenddate, empid, callback) {
    const query = {
        'profile.weekenddate': { $in: weekenddate}, empid: empid
    };        
    console.log('inside getUserProfileByWeekEndDate ', query);
    UserProfile.find(query, callback);

}
