//jshint esversion:6
require("dotenv").config(); //used to define environment variables.
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

mongoose.connect("mongodb://localhost:27017/userDB", {
    useNewUrlParser: true,
});

// 1. create a schema from the Mongoose Schema ready for encryption stuff
// We will encrypt the database.
const userSchema = new mongoose.Schema({
    email: String,
    password: String,
});

// 2a) apply the encyption to the database
// userSchema.plugin(encrypt, { secret: process.env.SECRET });
// 2b) apply the encrpytion to specified fields only:
userSchema.plugin(encrypt, {
    secret: process.env.SECRET,
    encryptedFields: ["password"],
});

// 3. create the model from the schema
const User = new mongoose.model("User", userSchema);

app.get("/", function (req, res) {
    res.render("home");
});
app.get("/login", function (req, res) {
    res.render("login");
});
app.get("/register", function (req, res) {
    res.render("register");
});

app.post("/register", function (req, res) {
    // create the brand new user
    const newUser = new User({
        email: req.body.username,
        password: req.body.password,
    });

    // now add the newUser to the database and direct them to the secrets page
    newUser.save(function (err) {
        if (!err) {
            res.render("secrets");
        } else {
            console.log(err);
        }
    });
});
app.post("/login", function (req, res) {
    // Do we have this user in the DB?
    const username = req.body.username;
    const password = req.body.password;

    console.log(username, password);

    // now look through the database to see if we have this user
    User.findOne(
        {
            email: username,
        },
        function (err, foundUser) {
            if (err) {
                console.log(err);
            } else {
                console.log("We are here");
                if (foundUser) {
                    if (foundUser.password === password) {
                        res.render("secrets");
                    }
                }
            }
        }
    );
});

app.listen(3000, function () {
    console.log("Server Listening on PORT 3000");
});
