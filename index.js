///////////////////////////////////
//REQUIRE NPM INSTALLATIONS BELOW
///////////////////////////////////

const express = require('express');
const app = express();
const router = express.Router();
const path = require('path');
const ejs = require('ejs');
const fs = require('fs');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const session = require('cookie-session');
const uuid = require('uuid');
const cookieParser = require('cookie-parser');

app.use(express.static('./json'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.set('view engine', 'ejs');

/////////////////////////////////
//CONNECTING MYSQL BELOW
/////////////////////////////////

//memory unleaked

app.set('trust proxy', 1);

//define session cookie

app.use(session({
    name: 'harel_insurance',
    secret: 'harel insurance and finances',
    secure: true,
    maxAge: 604800000 * 2,
    resave: false,
    saveUninitialized: true
}));

/////////////////////////////////
//CONNECTING MYSQL BELOW
/////////////////////////////////

var con = mysql.createPool({
    host: 'remotemysql.com',
    user: 'oV5jOl4N0I',
    password: 'GxEVT8q64b',
    database: 'oV5jOl4N0I'
});

/////////////////////////////////
//ALL NEW INSURANCE PAGE THINGS BELOW
/////////////////////////////////

//get links and open index.ejs

app.get('/', function(req, res) {
    res.render('public/index', {
        file: '',
        filename: '',
        random: '',
        details: ''
    });
});
app.get('/new_insurance', function(req, res) {
    res.render('public/index', {
        file: '',
        filename: '',
        random: '',
        details: ''
    });
});

//when user submits new insurance form

app.post('/', function(req, res) {

    //get form inputs and saves into variables

    var string = req.body.first;
    var first = string[0].toUpperCase() + string.slice(1);
    var string2 = req.body.last;
    var last = string2[0].toUpperCase() + string2.slice(1);
    var social = req.body.social;
    var email = req.body.email;
    var phone = req.body.phone;
    var amount = req.body.amount;
    var ins_num = req.body.ins_num;
    var ins_id = req.body.ins_id;
    var ins_comp = req.body.ins_comp;
    var comment = req.body.comment;

    //check if previos insurance id is not present in the database

    var sql = "SELECT count(*) as total FROM prev_insurance WHERE insurance_id = '" + ins_id + "'";
    var connectsql = con.query(sql, function(err, result) {

        if (result[0].total == 0) {

            //check if file with the name exists or not

            if (fs.existsSync('./json/' + first + last + '.json')) {

                //get json file and return json connected

                const jsonData = require('./json/' + first + last + '.json');
                console.log('json connected');

                //checks if form information matches to the json file

                if (
                    jsonData.FirstName.toLowerCase() == first.toLowerCase() &&
                    jsonData.LastName.toLowerCase() == last.toLowerCase() &&
                    jsonData.insuranceAmountRequested == amount &&
                    jsonData.insuranceData[0].PrevinsuranceCompanyName.toLowerCase() == ins_comp.toLowerCase() &&
                    jsonData.insuranceData[0].Previousinsurancenumber == ins_num &&
                    jsonData.insuranceData[0].PrevinsuranceID == ins_id
                ) {

                    //insert the data into the database

                    
                        console.log("Connected!");
                        var sql = "INSERT INTO prev_insurance (first_name,last_name,social_num,email,phone,insurance_amount,insurance_num,insurance_id,insurance_company,status,comments) VALUES ('" + first + "','" + last + "','" + social + "','" + email + "','" + phone + "','" + amount + "','" + ins_num + "','" + ins_id + "','" + ins_comp + "','In Review','" + comment + "')";
                        con.query(sql, function() {
                            console.log("1 record inserted");
                            console.log(jsonData.FirstName.toLowerCase());
                        });
                    

                    //outputs request number from json file if the details are correct

                    res.render('public/index', {
                        file: '',
                        filename: '',
                        random: jsonData.insuranceData[0].RequestNumber,
                        details: ''
                    });

                } else {

                    //outputs details incorrect if details not valid

                    res.render('public/index', {
                        file: '',
                        filename: '',
                        random: '',
                        details: 'no'
                    });

                }
            } else {

                //outputs file not found if json file is not found

                res.render('public/index', {
                    file: 'no',
                    filename: first + last + '.json',
                    random: '',
                    details: ''
                });

            }
        } else {

            //outputs error if social number is already present in database

            res.render('public/index', {
                file: '',
                filename: '',
                random: '',
                details: 'social'
            });

        }
    });
});

/////////////////////////////////
//ALL SIGN IN PAGE THINGS BELOW
/////////////////////////////////

//get links and redirect to signin page

app.get('/sign-in', function(req, res) {

    //checks if cookie exists

    var cookie = req.cookies['harel'];

    if (!cookie) {

        //take to signin page

        res.render('public/signin', {
            correct: ''

        });
    } else {

        //get data from database to put in dashboard

        var sql = 'SELECT * FROM prev_insurance ORDER BY status, date_added DESC';

        con.query(sql, function(err, data, fields) {

            //take to dashboard page

            res.render('public/dashboard', {
                userData: data,
                person: '',
            });

        });

    }

});


//on submit check username and password

app.post('/dashboard', function(req, res) {

    //get username and password from html form

    var username = req.body.username;
    var pass = req.body.pass;
    var remember = req.body.remember;

    //check if password and username are correct

    if ((username == 'class' && pass == '1234') || (username == 'Class' && pass == '1234')) {

        if (remember) {

            //set cookie

            var id = uuid.v4();

            res.cookie('harel', id, {
                secret: 'harel insurance and finances',
                secure: true,
                maxAge: 604800000 * 2,
                resave: false,
                saveUninitialized: true
            });

            //get data from database to put in dashboard

            var sql = 'SELECT * FROM prev_insurance ORDER BY status, date_added DESC';

            con.query(sql, function(err, data, fields) {

                //take to dashboard page

                res.render('public/dashboard', {
                    userData: data,
                    person: '',
                });

            });

        } else {

            //get data from database to put in dashboard

            var sql = 'SELECT * FROM prev_insurance ORDER BY status, date_added DESC';

            con.query(sql, function(err, data, fields) {

                //take to dashboard page

                res.render('public/dashboard', {
                    userData: data,
                    person: '',
                });

            });

        }

    } else {

        //output incorrect msg if username or password is incorrect

        res.render('public/signin', {
            correct: 'no'
        });

    }

});

/////////////////////////////////
//ALL DASHBOARD PAGE BELOW
/////////////////////////////////

//get dashboard

app.get('/dashboard', function(req, res) {

    //check if cookie exists

    var cookie = req.cookies['harel'];

    if (!cookie) {

        res.sendFile(path.join(__dirname + '/views/public/404.html'));

    } else {

        //display dashboard data along with severity

        var sql = "SELECT * FROM prev_insurance ORDER BY status, date_added DESC;";
        con.query(sql, function(err, data, fields) {
            res.render('public/dashboard', {
                userData: data,
                person: ''
            });
        });

    }


});

//when user clicks calculate

app.post('/calculate', function(req, res) {

    //get data from hidden html form in dashboard and JSON file

    var user_id = req.body.user_id;
    var user_name = req.body.user_name;
    const jsonData = require('./json/' + user_name + '.json');
    var request = jsonData.insuranceData[0].RequestNumber;
    var fee = jsonData.insuranceData[0].insuranceCompanyfee;
    var ins_enable = jsonData.insuranceEnable;
    var date_enable = jsonData.dateofEnblment;
    var car_status = jsonData.CarStatus;
    var userrank = jsonData.UserRank;
    var message = jsonData.message;
    var severity = null;

    //get severity

    if (userrank == 1) {
        severity = 'low';
    } else if (userrank == 2) {
        severity = 'medium';
    } else if (userrank == 3) {
        severity = 'high';
    } else if (userrank == 4) {
        severity = 'severe';
    }

    //update the table and add data from json file to it

    var update = "UPDATE prev_insurance SET status = 'Reviewed', severity = '" + severity + "', request = " + request + ", fee = " + fee + ", ins_enable = " + ins_enable + ", date_enable = '" + date_enable + "', car_status = '" + car_status + "', message = '" + message + "' WHERE ID = " + user_id + ";";
    con.query(update);

    //display dashboard data along with severity

    var sql = "SELECT * FROM prev_insurance ORDER BY status, date_added DESC;";
    con.query(sql, function(err, data, fields) {
        res.render('public/dashboard', {
            userData: data,
            person: ''
        });
    });

});

//when user clicks details

app.post('/details', (req, res) => {

    //get data from hidden form in dashboard

    var user_id = req.body.user_id;

    //display ALL database and json data in a new view

    var sql = "SELECT * FROM prev_insurance WHERE ID = '" + user_id + "';";
    con.query(sql, function(err, data, fields) {
        res.render('public/dashboard', {
            userData: data,
            person: 'yes'
        });
    });

});

//when user clicks back button

app.post('/back', function(req, res) {

    var sql = "SELECT * FROM prev_insurance ORDER BY status, date_added DESC;";

    con.query(sql, function(err, data, fields) {
        res.render('public/dashboard', {
            userData: data,
            person: ''
        });
    });

});

//when user click sign out

app.post('/sign-in', function(req, res) {

    res.clearCookie('harel');

    res.render('public/signin', {
        correct: ''
    });

});

/////////////////////////////////
//ALL ILLEGAL LINKS AND ACCESS BELOW
/////////////////////////////////

app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname + '/views/public/404.html'));
});


/////////////////////////////////
//LISTEN SERVER AND CONNECT TO PORT
/////////////////////////////////

var port = 8080;

app.listen(process.env.PORT || port);
