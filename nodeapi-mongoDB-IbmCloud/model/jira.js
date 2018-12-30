const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/database');
const JiraSchema = mongoose.Schema({
    jira: {
        type: String,
        required: true,
        unique: true
    },
    project: {
        type: String,
        required: true
    }  
});


const JiraInfo = module.exports = mongoose.model('JiraInfo', JiraSchema);




module.exports.getJira = function (callback) {
    JiraInfo.find(callback);
}
module.exports.getProjectBasedOnJira = function (jira,callback) {

    const query = { jira: jira };
    UserProfile.find(query, callback);

}
