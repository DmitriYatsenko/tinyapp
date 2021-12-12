const express = require("express");
const app = express();
const bcrypt = require('bcryptjs');
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
    let urlSubDatabase = {};
    for (let shortURL in urlDatabase) {
        if (urlDatabase[shortURL].user_id === user_id) {
            urlSubDatabase[shortURL] = urlDatabase[shortURL]
        }
    }
    return urlSubDatabase;
}

const getUserByEmail = function (email, database) {
    let user;
    for (let users in database) {
        if (database[users].email === email) {
            user = users;
        }
    }
    return user;
};

app.get("/", (req, res) => {
    res.send("Hello!");
});

app.get("/urls", (req, res) => {
    const templateVars = {
        user: users[req.session.user_id],
        urls: userURLs(urlDatabase, req.session.user_id)
    };
    if (req.session.user_id) {
        res.render("urls_index", templateVars);
    } else {
        res.redirect(`/login`);
    }
});

app.post("/urls", (req, res) => {
    const longURL = req.body.longURL;
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = { longURL: `http://${longURL}`, user_id: req.session.user_id };
    res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
    const templateVars = {
        urls: urlDatabase,
        user: users[req.session.user_id]
    };
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
    res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
    const shortURL = req.params.shortURL;
    const longURL = req.body.longURL;
    urlDatabase[shortURL] = { longURL: `http://${longURL}`, user_id: req.session.user_id };
    res.redirect(`/urls`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
    const shortURL = req.body.my_URL;
    delete urlDatabase[shortURL];
    res.redirect(`/urls`);
});

app.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/register", (req, res) => {
    const templateVars = { user: users[req.session.user_id] };
    res.render("register", templateVars);
});

app.post("/register", (req, res) => {
    let newUserID = Math.round(1000000000 * Math.random());
    let newUserEmail = req.body.email;
    let newUserPassword = req.body.password;

    // let userExists = false;
    // for (let user in users) {
    //     if (users[user].email === newUserEmail) {
    //         userExists = true;
    //     }
    // }
    if (getUserByEmail(newUserEmail, users)) {
        res.send("Email already in use");
    } else {
        let userIDexists = false;
        for (let use in users) {
            if (users[use].id === newUserID) {
                userIDexists = true;
            }
        }
        while (userIDexists) {
            newUserID = Math.round(1000000000 * Math.random());
        }

        users[newUserID] = {
            id: newUserID,
            email: newUserEmail,
            password: bcrypt.hashSync(newUserPassword, 10)
        };

        req.session.user_id = newUserID;
        // let a1 = req.session.user_id;
        // res.cookie('user_id', a1);
        setTimeout(() => {
            res.redirect(`/urls`);
        }, 1000);
    }
});

app.get("/login", (req, res) => {
    const templateVars = { user: users[req.session.user_id] };
    res.render("login", templateVars);
});

app.post("/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    let correct = false;
    let userID;
    for (let user in users) {
        if (users[user].email === email && bcrypt.compareSync(password, users[user].password)) {
            correct = true;
            userID = users[user].id;
        }
    }
    if (correct) {
        // res.session('user_id', userID);
        req.session.user_id = userID;
        res.redirect(`/urls`);
    } else {
        res.send("Login in4m8n incorrect");
    }
});

app.post("/logout", (req, res) => {
    req.session = null;
    res.redirect(`/urls`);
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});