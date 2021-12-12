const { assert } = require('chai');

const getUserByEmail = require('../helpers');

const testUsers = {
    "user1RandomID": {
        id: "user1RandomID",
        email: "user1@example.com",
        password: "purple-monkey-dinosaur"
    },
    "user2RandomID": {
        id: "user2RandomID",
        email: "user2@example.com",
        password: "dishwasher-funk"
    }
};

describe('getUserByEmail', function () {
    it('should return a user with valid email', function () {
        const user = getUserByEmail("user1@example.com", testUsers)
        const expectedUserID = "user1RandomID";
        assert.strictEqual(user, expectedUserID);
    });
    it('should return undefined for a non-existent email', function () {
        const user = getUserByEmail("user@example.com", testUsers)
        assert.strictEqual(user, undefined);
    });
});