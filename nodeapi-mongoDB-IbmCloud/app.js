//importing modules
var express = require('express');
var mongoose = require('mongoose');
var util = require('util');
var mongodbUri = require('mongodb-uri');
var cfenv = require('cfenv');
var bodyparser = require('body-parser');
var cors = require('cors');
var path = require('path');
var passport = require('passport');
const route = require('./routes/route');
const config = require('./config/database');

//connect to db local

var dbURI = config.database;
mongoose.connect(dbURI, { auto_reconnect: true });
mongoose.connection.on('connected', function () {
    console.log('connected to database');
});
mongoose.connection.on('error', function (error) {
    console.error('Error in MongoDb connection: ' + error);
    mongoose.disconnect();
});


var app = express();
//port
const port = process.env.PORT ||8080;


//adding middleware

app.use(cors());

//adding body-parser

app.use(bodyparser.json());

//passport middleware
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

//static file

app.use(express.static(path.join(__dirname, 'public')));

//routes
app.use('/api', route);

//invalid endpoint

app.get('/', function (req, res) {
    res.send('invalid endpoint');
})

app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'public/index.html'))
})

//testing server
app.get('/', function (req, res) {
    res.send('test fine');
});

var server = app.listen(port, function () {
    console.log('Server listening at http://' + server.address().address + ':' + server.address().port);
}
);


