const express = require('express');
let books = require("./booksdb.js");
const axios = require("axios");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const { username, password } = req.query;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    const userExists = users.some(user => user.username === username);

    if (userExists) {
        return res.status(409).json({ message: "Username already exists" });
    }

    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    const getBookList = new Promise((resolve, reject) => {
        if (books) {
            resolve(books);
        } else {
            reject("BookList not found");
        }
    });

    getBookList
        .then(bookList => res.status(200).send(JSON.stringify(bookList, null, 4)))
        .catch(error => res.status(500).json({ message: error }));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;

    const getBookDetails = new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) {
            resolve(book);
        } else {
            reject("Book not found");
        }
    });

    getBookDetails
        .then(book => res.status(200).send(JSON.stringify(book, null, 4)))
        .catch(error => res.status(404).json({ message: error }));

 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;

    const getBooksByAuthor = new Promise((resolve, reject) => {
        const keys = Object.keys(books);
        const results = [];

        keys.forEach(key => {
            if (books[key].author.toLowerCase() === author.toLowerCase()) {
                results.push(books[key]);
            }
        });

        if (results.length > 0) {
            resolve(results);
        } else {
            reject("No books found by this author");
        }
    });

    getBooksByAuthor
        .then(books => res.status(200).send(JSON.stringify(books, null, 2)))
        .catch(error => res.status(404).json({ message: error }));
  
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;

    const getBooksByTitle = new Promise((resolve, reject) => {
        const keys = Object.keys(books);
        const results = [];

        keys.forEach(key => {
            if (books[key].title.toLowerCase() === title.toLowerCase()) {
                results.push(books[key]);
            }
        });

        if (results.length > 0) {
            resolve(results);
        } else {
            reject("No book found for this title");
        }
    });

    getBooksByTitle
        .then(books => res.status(200).send(JSON.stringify(books, null, 2)))
        .catch(error => res.status(404).json({ message: error }));

});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    // Find the review with the isbn
    let review = book.review;
    return res.send(JSON.stringify(review, null, 2));
  }

  return res.send("Book with the isbn provided not found");
});

module.exports.general = public_users;
