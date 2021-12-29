const express = require("express");
const app = express();
const bcrypt = require('bcryptjs');
const getUserByEmail = require('./helpers');
const PORT = 8080;
const users = {};
const urlDatabase = {};
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2']
}))
app.set("view engine", "ejs");

// List of acceptable characters (numbers & letters) to generate random user IDs
function generateRandomString() {
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let string = "";
    for (i = 0; i < 6; i++) {
        let x = characters.charAt(Math.floor(characters.length * Math.random()));
        string += x;
    }
    return string;
}

function userURLs(urlDatabase, user_id) {
    // For logged in user, only show the short URLs they created, not other users' URLs
    let urlSubDatabase = {};
    for (let shortURL in urlDatabase) {
        if (urlDatabase[shortURL].user_id === user_id) {
            urlSubDatabase[shortURL] = urlDatabase[shortURL]
        }
    }
    return urlSubDatabase;
}

app.get("/", (req, res) => {
    res.send("Hello!");
});

app.get("/urls", (req, res) => {
    const templateVars = {
        user: users[req.session.user_id],
        urls: userURLs(urlDatabase, req.session.user_id)
    };
    // Check if user is logged in
    if (req.session.user_id) {
        res.render("urls_index", templateVars);
    } else {
        res.redirect(`/login`);
    }
});

app.post("/urls", (req, res) => {
    // Check if user is logged in
    if (req.session.user_id) {
        const longURL = req.body.longURL;
        const shortURL = generateRandomString();
        urlDatabase[shortURL] = { longURL: `${longURL}`, user_id: req.session.user_id };
        res.redirect(`/urls/${shortURL}`);
    } else {
        res.redirect(`/login`);
    }
});

app.get("/urls/new", (req, res) => {
    const templateVars = {
        urls: urlDatabase,
        user: users[req.session.user_id]
    };
    // Check if user is logged in
    if (templateVars.user) {
        res.render("urls_new", templateVars);
    } else {
        res.redirect(`/login`);
    }
});

app.get("/urls/:shortURL", (req, res) => {
    const templateVars = {
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL].longURL,
        user: users[req.session.user_id],
        correct: urlDatabase[req.params.shortURL].user_id === req.session.user_id
    };
    // Check if user is logged in
    if (templateVars.user) {
        res.render("urls_show", templateVars);
    } else {
        res.redirect(`/login`);
    }
});

app.post("/urls/:shortURL", (req, res) => {
    // Check if user is logged in
    if (req.session.user_id) {
        const shortURL = req.params.shortURL;
        const longURL = req.body.longURL;
        urlDatabase[shortURL] = { longURL: `${longURL}`, user_id: req.session.user_id };
        res.redirect(`/urls`);
    } else {
        res.redirect(`/login`);
    }
});

app.post("/urls/:shortURL/delete", (req, res) => {
    // Check if user is logged in
    if (req.session.user_id) {
        const shortURL = req.body.my_URL;
        delete urlDatabase[shortURL];
        res.redirect(`/urls`);
    } else {
        res.redirect(`/login`);
    }
});

app.get("/u/:shortURL", (req, res) => {
    // Redirect to webpage for which the shortURL was created
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
});

app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/register", (req, res) => {
    // Check if user is logged in
    if (req.session.user_id) {
        res.redirect(`/urls`);
    }
    const templateVars = { user: users[req.session.user_id] };
    res.render("register", templateVars);
});

app.post("/register", (req, res) => {
    // User ID automatically randomly generated, email & password taken from user input
    let newUserID = Math.round(1000000000 * Math.random());
    let newUserEmail = req.body.email;
    let newUserPassword = req.body.password;

    if (!newUserEmail && !newUserPassword) {
        res.send("Email & password cannot be empty");
    } else if (!newUserEmail) {
        res.send("Email cannot be empty");
    } else if (!newUserPassword) {
        res.send("Password cannot be empty");
    } else if (getUserByEmail(newUserEmail, users)) {
        res.send("Email already in use");
    } else {
        let userIDexists = false;
        for (let use in users) {
            if (users[use].id === newUserID) {
                userIDexists = true;
            }
        }
        while (userIDexists) {
            /*
            Just in case the randomly generated user ID is already in use (astronomically unlikely)
            the program will regenerate a different user ID. It will repeat the process until it generates
            a user ID that is not in use, at which point it will exit the loop.
            */
            newUserID = Math.round(1000000000 * Math.random());
            userIDexists = false;
            for (let use in users) {
                if (users[use].id === newUserID) {
                    userIDexists = true;
                }
            }
        }

        // Add new user to database
        users[newUserID] = {
            id: newUserID,
            email: newUserEmail,
            password: bcrypt.hashSync(newUserPassword, 10)
        };

        req.session.user_id = newUserID;
        setTimeout(() => {
            res.redirect(`/urls`);
        }, 1000);
    }
});

app.get("/login", (req, res) => {
    // Check if user is logged in
    if (req.session.user_id) {
        res.redirect(`/urls`);
    }
    const templateVars = { user: users[req.session.user_id] };
    res.render("login", templateVars);
});

app.post("/login", (req, res) => {
    // Get user input
    const email = req.body.email;
    const password = req.body.password;

    // Check if login correct
    let correct = false;
    let userID;
    for (let user in users) {
        if (users[user].email === email && bcrypt.compareSync(password, users[user].password)) {
            correct = true;
            userID = users[user].id;
        }
    }
    if (correct) {
        req.session.user_id = userID;
        res.redirect(`/urls`);
    } else {
        res.send("Login incorrect");
    }
});

app.post("/logout", (req, res) => {
    // Clear cookies & redirect to /urls which in turn redirects to /login
    req.session = null;
    res.redirect(`/urls`);
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});