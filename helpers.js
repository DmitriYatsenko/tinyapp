const getUserByEmail = function (email, database) {
    let user;
    for (let users in database) {
        if (database[users].email === email) {
            user = users;
        }
    }
    return user;
};

module.exports = getUserByEmail;