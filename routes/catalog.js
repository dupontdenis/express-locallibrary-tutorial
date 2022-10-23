const express = require("express");
const router = express.Router();

// Require our controllers.
const book_controller = require("../controllers/bookController");
const author_controller = require("../controllers/authorController");
const { route } = require(".");

/// BOOK ROUTES ///

// GET catalog home page

router.route('/')
    .get(book_controller.index)

router.route("/book/create")
    .get(book_controller.book_create_get)
    .post(book_controller.book_create_post)

// GET request to delete Book.
router.route("/book/:id/delete")
    .get(book_controller.book_delete_get)
    .post(book_controller.book_delete_post);
//


// GET request to update Book.
router.route("/book/:id/update")
    .get(book_controller.book_update_get)
    .post(book_controller.book_update_post)

// GET request for one Book.
router.get("/book/:id", book_controller.book_detail);

// GET request for list of all Book.
router.get("/books", book_controller.book_list);

/// AUTHOR ROUTES ///

router.route("/author/create")
    // GET request for creating Author. NOTE This must come before route for id (i.e. display author).
    .get(author_controller.author_create_get)
    // POST request for creating Author.
    .post(author_controller.author_create_post)


// GET request to delete Author.
router.route("/author/:id/delete")
    .get(author_controller.author_delete_get)
    // POST request to delete Author
    .post(author_controller.author_delete_post);

router.route("/author/:id/update")
    // GET request to update Author.
    .get(author_controller.author_update_get)
    // POST request to update Author.
    .post(author_controller.author_update_post);

// GET request for one Author.
router.get("/author/:id", author_controller.author_detail);

// GET request for list of all Authors.
router.get("/authors", author_controller.author_list);

module.exports = router;
