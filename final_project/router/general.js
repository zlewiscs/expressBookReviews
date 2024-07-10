const express = require('express');
let books = require("./booksdb.js");
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
public_users.get('/',function (req, res) {
  return res.send(JSON.stringify(books,null,4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
   const isbn = req.params.isbn;
   const book = books[isbn];

    if (book) {
        return res.status(200).send(JSON.stringify(book, null, 4)); // Neatly formatted JSON output
    } else {
        return res.status(404).json({ message: "Book not found" });
    }

 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  const keys = Object.keys(books);
    const results = [];

    keys.forEach(key => {
        if (books[key].author.toLowerCase() === author.toLowerCase()) {
            results.push(books[key]);
        }
    });

    if (results.length > 0) {
        return res.status(200).send(JSON.stringify(results, null, 2)); // Neatly formatted JSON output
    } else {
        return res.status(404).json({ message: "No books found by this author" });
    }
  
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  const keys = Object.keys(books);
  const result = [];

  keys.forEach(key => {
    if (books[key].title.toLowerCase() === title.toLocaleLowerCase()) {
        result.push(books[key])
    }
  });

  if (result.length > 0) {
    return res.status(200).send(JSON.stringify(result, null, 2));
  } else {
    return res.status(404).json({message: "No book found for this title"});
  }

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
