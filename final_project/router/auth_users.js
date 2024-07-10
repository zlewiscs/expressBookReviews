const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{
    return users.some(user => user.username === username && user.password === password);

}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in"});
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const { review } = req.body;

    if (!req.session.authorization || !req.session.authorization.username) {
        return res.status(401).json({ message: "User not logged in" });
    }

    const username = req.session.authorization.username;

    if (!review) {
        return res.status(400).json({ message: "Review content is required" });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    const book = books[isbn];
    const existingReview = book.reviews.find(r => r.username === username);

    if (existingReview) {
        // Modify the existing review
        existingReview.review = review;
    } else {
        // Add a new review
        book.reviews.push({ username, review });
    }

    return res.status(200).json({ message: "Review posted successfully" });
});

// Delete a review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;

    if (!req.session.authorization || !req.session.authorization.username) {
        return res.status(401).json({ message: "User not logged in" });
    }

    const username = req.session.authorization.username;

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    const book = books[isbn];
    const reviewIndex = book.reviews.findIndex(r => r.username === username);

    if (reviewIndex === -1) {
        return res.status(404).json({ message: "Review not found" });
    }

    book.reviews.splice(reviewIndex, 1);
    return res.status(200).json({ message: "Review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
