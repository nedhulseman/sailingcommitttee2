const express = require('express');
const mysql = require("mysql")
const path = require("path")
const dotenv = require('dotenv')
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const Joi = require('joi');
const session = require("express-session");
var socketio = require('socket.io');
const saltRounds = 11;



//const app = express(); // replaced with below
const app = require('http').createServer(express);
//const io = require('socket.io')(app);
var io = socketio(app);

dotenv.config({ path: './.env'})


const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
})

const publicDir = path.join(__dirname, './public')

app.use(express.static(publicDir))
app.use(express.urlencoded({extended: 'false'}))
app.use(express.json())

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  name  : 'nh',
  secret: '398dhd',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // This will only work if you have https enabled!
    maxAge: 60000000 // 1 min
  }
}));
var sessionChecker = (req, res, next) => {
    console.log("... checking session");
    console.log(`Session Checker: ${req.session.email}`.green);
    console.log(req.session);
    if (req.session.email) {
        console.log(`Found User Session`.green);
        next();
    } else {
        console.log(`No User Session Found`.red);
        res.redirect('/login');
    }
};

app.set('view engine', 'hbs')

db.connect((error) => {
    if(error) {
        console.log(error)
    } else {
        console.log("MySQL connected!")
    }
})

app.get("/", sessionChecker, (req, res) => {
    res.render("index", {"username":req.session.username})
})

app.get("/register", (req, res) => {
    res.render("register")
})

app.get("/login", (req, res) => {
    res.render("login")
})
app.get("/race", (req, res) => {
  res.render("race");
})

app.post("/auth/login", async function(req, res, next) {
    console.log("login attemped");
    const { email, password } = req.body
    const message = 'No users found with these credentials';
    db.query('SELECT * FROM users WHERE email = ?', [email], async (error, query_result) => {
        if (error) {
            console.log(error)
        }
        console.log(query_result);
        if (query_result.length == 0) { // no users found
            console.log("No users found with these credentials");
            res.render('login', {message:message});
        } else if (query_result.length > 1) {
            console.log("Multiple users associated with email");
            res.render('login', {message:message});
        } else { // user exists but password has not been validated
            bcrypt.compare(password, query_result[0].password, (error, result) => {
                console.log(result);
                if (result) {
		    req.session.email = query_result[0].email;
		    req.session.username = query_result[0].name;
                    res.redirect('/');
                }
                else {
                    console.log("No users found with these credentials");
                    res.render('login', {message:message});
                }
            })
        }
    });


})

app.post("/auth/register", (req, res) => {
    const { name, email, password, password_confirm } = req.body
    db.query('SELECT email FROM users WHERE email = ?', [email], async (error, result) => {
        if(error){
            console.log(error)
        }

        if( result.length > 0 ) {
            return res.render('register', {
                message: 'This email is already in use'
            })
        } else if(password !== password_confirm) {
            return res.render('register', {
                message: 'Password Didn\'t Match!'
            })
        }

        let hashedPassword = await bcrypt.hash(password, saltRounds)

        console.log(hashedPassword)

        db.query('INSERT INTO users SET?', {name: name, email: email, password: hashedPassword}, (err, result) => {
            if(error) {
                console.log(error)
            } else {
                return res.render('register', {
                    message: 'User registered!'
                })
            }
        })
    })
})

app.get('/logout', async function(req, res, next) {
    req.session.destroy(function(err) {
        console.log('Destroyed session')
     })
    res.redirect('/');
});

app.listen(5000, ()=> {
    console.log("server started on port 5000")
})
