const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.set("view engine", "ejs");

const users = {
    "user1RandomID": {
        id: "userRandomID",
        email: "user@example.com",
        password: "purple-monkey-dinosaur"
    },
    "user2RandomID": {
        id: "user2RandomID",
        email: "user2@example.com",
        password: "dishwasher-funk"
    }
};

function generateRandomString() {
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let string = "";
    for (i = 0; i < 6; i++) {
        let x = characters.charAt(Math.floor(characters.length * Math.random()));
        string += x;
    }
    return string;
}

const urlDatabase = {
    //"b2xVn2": "http://www.lighthouselabs.ca",
    //"9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
    res.send("Hello!");
});

app.get("/urls", (req, res) => {
    const templateVars = {
        urls: urlDatabase,
        user: users[req.cookies.user_id]
    };
    res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
    const longURL = req.body.longURL;
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = `http://${longURL}`;
    console.log(urlDatabase);
    setTimeout(() => {
        res.redirect(`/urls/${shortURL}`);
    }, 1000);
});

app.get("/urls/new", (req, res) => {
    const templateVars = {
        urls: urlDatabase,
        user: users[req.cookies.user_id]
    };
    res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
    const templateVars = {
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL],
        user: users[req.cookies.user_id]
    };
    res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
    const shortURL = req.params.shortURL;
    const longURL = req.body.longURL;
    urlDatabase[shortURL] = `http://${longURL}`;
    setTimeout(() => {
        res.redirect(`/urls`);
    }, 1000);
});

// app.get("/urls/:shortURL/delete", (req, res) => {
//     // const templateVars = {
//     //     shortURL: req.params.shortURL,
//     //     longURL: urlDatabase[req.params.shortURL],
//     //     username: req.cookies["username"]
//     // };
//     //res.render("urls_show", templateVars);
//     setTimeout(() => {
//         res.redirect(`/urls`);
//     }, 1000);
// });

app.post("/urls/:shortURL/delete", (req, res) => {
    const shortURL = req.body.my_URL;
    delete urlDatabase[shortURL];
    //setTimeout(() => {
    res.redirect(`/urls`);
    //}, 1000);
});

app.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL];
    setTimeout(() => {
        res.redirect(longURL);
    }, 1000);
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    let correct = false;
    let userID;
    for (let user in users) {
        if (users[user].email === email && users[user].password === password) {
            correct = true;
            userID = users[user].id;
        }
    }
    if (correct) {
        res.cookie('user_id', userID);
        setTimeout(() => {
            res.redirect(`/urls`);
        }, 1000);
    } else {
        res.send("Login in4m8n incorrect");
        // setTimeout(() => {
        //     res.redirect(`/urls`);
        // }, 1000);
    }
});

app.post("/logout", (req, res) => {
    res.clearCookie('user_id');
    //setTimeout(() => {
    res.redirect(`/urls`);
    //}, 1000);
});

app.get("/register", (req, res) => {
    const templateVars = { user: users[req.cookies.user_id] };
    res.render("register", templateVars);
    // setTimeout(() => {
    //     res.redirect(`/urls`);
    // }, 1000);
});

app.post("/register", (req, res) => {
    let newUserID = Math.round(1000000000 * Math.random());
    let newUserEmail = req.body.email;
    let newUserPassword = req.body.password;

    let userExists = false;
    for (let user in users) {
        if (users[user].email === newUserEmail) {
            userExists = true;
        }
    }
    if (userExists) {
        res.send("Email already in use");
        // setTimeout(() => {
        //     res.redirect(`/urls`);
        // }, 1000);
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
            password: newUserPassword
        };

        res.cookie('user_id', newUserID);
        setTimeout(() => {
            res.redirect(`/urls`);
        }, 1000);
    }
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});