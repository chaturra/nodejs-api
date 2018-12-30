const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const Contact = require('../model/contacts');
const Login = require('../model/login');
const User = require('../model/user');
const UserProfile = require('../model/profentry');
const JiraInfo = require('../model/jira');
const config = require('../config/database');
//retrieving contacts

router.get('/contacts', function (req, res, next) {
    Contact.find(function (err, contacts) {
        res.json(contacts);
    });
    });

//profile
router.get('/profile', passport.authenticate('jwt', {session:false} ),function(req, res, next) {
    res.json({ user: req.user });
});
//add contacts
router.post('/contact', function (req, res, next) {
    let newContact = new Contact({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        phone: req.body.phone
    }
    );

    newContact.save(function (err, contact) {
        if (err) {
            res.json({ msg: 'failed to add contacts' });
        }
        else {
            res.json({ msg: 'added contact successfully' });
        }
    }
    );

}
);
//save user profile
router.post('/userprofile', function (req, res, next) {
    var i = 0;
    var userprofiles = req.body.userprofile;
    var len= userprofiles.length;
    var user = req.body.user;
    var errcount = 0;
    for (var i = 0; i < len; i++) {
        let newUserProfile = new UserProfile({
            name: user.name,
            empid: user.empid,
            profile: userprofiles[i]
        })
        UserProfile.addProfile(newUserProfile, (err, userprofile) => {
            if (err) {
                console.log(err);
                errcount++;
            }
        }
        );
    }
    if (errcount == 0) {
        res.json({ success: true, msg: 'profile add successfully' })
    }
    else {
        res.json({ success: false, msg: 'failed to add profile' });
    }
}
);

//upadate timesheet

router.put('/updatetimesheet', function (req, res, next) {
    var data = req.body;
    var updateddata = {
        name: data.name,
        empid: data.empid,
        profile: [{
            Area: data.profile[0].Area,
            Technology: data.profile[0].Technology,
            ProjectPhase: data.profile[0].ProjectPhase,
            Jira: data.profile[0].Jira,
            Project: data.profile[0].Project,
            weekenddate: data.profile[0].weekenddate,
            weekstartdate: data.profile[0].weekstartdate,
            effort: data.profile[0].effort
        }]
    }
    
    UserProfile.updateProfile(data, updateddata,(err, userprofile) => {
        if (err) {
            console.log(err);
            res.json({ success: false, msg: 'failed to update profile' });
        }
        else {
            res.json({ success: true, msg: 'failed to update profile' });
        }
    }
    );
});
    



//register
router.post('/register', function (req, res, next) {
    let newUser = new User({
        name: req.body.name,
        email: req.body.email,
        empid: req.body.empid,
        password: req.body.password,
        emptype:  req.body.emptype
    }
    );
    if (req.body.name == null || req.body.name == '' || req.body.empid == null || req.body.empid == '' || req.body.email == null || req.body.email == '' || req.body.password == null || req.body.password == ''||req.body.emptype==null||req.body.emptype=='') {
        res.json({
            success: false, msg: 'Ensure  Name,empid,Email,Password were provided'
        });
    }
    else {
        User.addUser(newUser, (err, user) => {
            if (err) {
                res.json({ success: false, msg: 'email already exists!' });
            }
            else {
                res.json({ success: true, msg: ' User Registered' });
            }
        }
        );
    }

}
);

//Authenticate
router.post('/authenticate', function (req, res, next) {
    const email = req.body.email;
    const password = req.body.password;
    User.getUserByEmail(email, function (err, user) {
        if (err != null && err) throw err;
        if (user == null) {
            res.json({ success: false, msg: 'User Not Found' });
        }
        if (null != user && null != user.password) {
            User.comparePassword(password, user.password, function (err, isMatch) {
                console.log(password);
                if (err) throw err;
                if (isMatch) {
                    const token = jwt.sign(user.toJSON(), config.secret, { expiresIn: 216000 });
                    res.json({ success: true, token: 'JWT ' + token, user: { id: user._id, name: user.name, emptype: user.emptype, email: user.email } });
                }
                else {
                    res.json({ success: false, msg: 'Wrong Password' });
                }
            });
        }
    });
    

}
);
//delete contact
router.delete('/contact/:id', function (req, res, next) {

    Contact.remove({ _id: req.params.id }, function (err, result) {
        if (err) {
            res.json(err);
        }
        else {
            res.json(result);
        }
    }
    );
}
);

//Extract UserProfileBasedOnArea
router.get('/userprofileBasedOnArea', passport.authenticate('jwt', { session: false }),function (req, res, next) {
    const area = req.query.Area;
    const strdate = req.query.StrDate;
    var res1 = [];
    var res2 = [];
    res1 = strdate.split("-");
    var newstrdate = res1[1] + '/' + res1[2] + '/' + res1[0];
    const enddate = req.query.EndDate;
    res2 = enddate.split("-");
    var newenddate = res2[1] + '/' + res2[2] + '/' + res2[0];

    UserProfile.getUserProfileByArea(area, newstrdate, newenddate, function (err, userprofile) {
        if (err != null && err) throw err;
        if (userprofile == null) {
            res.json({ success: false, msg: 'User Not Found' });
        }
        else {
            res.json({ success: true, userprofile });
        }

    });
});

//Extract userprofilebasedondate

router.get('/userprofileBasedOnWeekEndDate', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    var weekenddate = [];
    weekenddate = req.query.WeekEndDate;
    var len = weekenddate.length;
    var newArray = [];
    var ind = 0;
    var temp1 = '';
    for (var i = 0; i < 10; i++) {
        temp1 = temp1 + weekenddate[i];
    }
    newArray.push(temp1);
    var temp2 = '';
    for (var i = 11; i < 21; i++) {
        temp2 = temp2 + weekenddate[i];
    }
    newArray.push(temp2);
    var temp3 = '';
    for (var i =22 ; i < 32; i++) {
        temp3 = temp3 + weekenddate[i];
    }
    newArray.push(temp3);
    var temp4 = '';
    for (var i = 33; i < 44; i++) {
        temp4 = temp4 + weekenddate[i];
    }
    newArray.push(temp4);
    const empid = req.query.EmpId;
    
    UserProfile.getUserProfileByWeekEndDate(newArray, empid, function (err, userprofile) {
        if (err != null && err) throw err;
        if (userprofile == null) {
            res.json({ success: false, msg: 'User Not Found' });
        }
        else {
            res.json({ success: true, userprofile });
        }

    });
});


//Add jira and project information

router.post('/addjira', function (req, res, next) {
    let newjirainfo = new JiraInfo({
        jira: req.body.jira,
        project: req.body.project
    }
    );

    newjirainfo.save(function (err, jira) {
        if (err) {
            res.json({ success:false, msg: 'failed to add jirainfo' });
        }
        else {
            res.json({ success: true, msg: 'added jirainfo successfully' });
        }
    }
    );

}
);

//get jira info

router.get('/fetchjirainfo', passport.authenticate('jwt', { session: false }), function (req, res, next) {

    JiraInfo.getJira(function (err, jira) {
        if (err != null && err) throw err;
        if (jira == null) {
            res.json({ success: false, msg: 'jirainfo Not Found' });
        }
        else {
            res.json({ success: true, jira});
        }

    });
});

    

module.exports = router;  