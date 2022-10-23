const Book = require("../models/book");
const Author = require("../models/author");

const { body, validationResult } = require("express-validator");

const async = require("async");

exports.index = async (req, res) => {

  const details = Promise.all([
    Author.countDocuments({}),
    Book.countDocuments({})
  ]);

  try {
    // wait...
    const [nbAuthors, nbBooks] = await details;
    // console.log(details)
    if (nbAuthors == null) {
      // No results.
      const err = new Error("Author not found");
      err.status = 404;
      return next(err);
    }
    // Successful, so render.
    res.render("index", {
      title: "Local Library Home",
      data: { author_count: nbAuthors, book_count: nbBooks }
    });
  } catch (error) {
    console.log(error.message); // 
  }

};

// Display list of all books.
exports.book_list = function (req, res, next) {
  Book.find({}, "title author")
    .sort({ title: 1 })
    .populate("author")
    .exec(function (err, list_books) {
      if (err) {
        return next(err);
      } else {
        // Successful, so render
        res.render("book_list", { title: "Book List", book_list: list_books });
      }
    });
};

// Display detail page for a specific book.
exports.book_detail = function (req, res, next) {
  async.parallel(
    {
      book: function (callback) {
        Book.findById(req.params.id)
          .populate("author")
          .exec(callback);
      }
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.book == null) {
        // No results.
        var err = new Error("Book not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("book_detail", {
        title: results.book.title,
        book: results.book,
      });
    }
  );
};

// Display book create form on GET.
exports.book_create_get = function (req, res, next) {
  // Get all authors which we can use for adding to our book.
  async.parallel(
    {
      authors: function (callback) {
        Author.find(callback);
      }
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      res.render("book_form", {
        title: "Create Book",
        authors: results.authors,
      });
    }
  );
};

// Handle book create on POST.
exports.book_create_post = [
  // Validate and sanitize fields.
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("author", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }).escape(),
  // Process request after validation and sanitization.
  async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped and trimmed data.
    var book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      try {

        // Get all authors for form.
        const details = Promise.all([
          Author.find()]);
        const [authors] = await details;

        res.render("book_form", {
          title: "Create Book",
          authors: authors,
          book: book,
          errors: errors.array(),
        });
      } catch (error) {
        console.log(error.message); // 

      }

      return;
    }
    else {
      try {
        // Data from form is valid. Save book.
        const { url } = await book.save();
        // Successful - redirect to new book record.
        res.redirect(url);

      } catch (error) {
        console.log(error.message);
      }
    }
  }
];

// Display book delete form on GET.
exports.book_delete_get = async (req, res, next) => {

  const book = await Book.findById(req.params.id).populate("author")

  // console.log(book)
  try {
    if (book == null) {
      // No results.
      res.redirect("/catalog/books");
    }
    // Successful, so render.
    res.render("book_delete", {
      title: "Delete Book",
      book: book,
    });
  } catch (error) {
    console.log(error.message); // 
  }
};

// Handle book delete on POST.
exports.book_delete_post = async (req, res, next) => {
  // Assume the post has valid id (ie no validation/sanitization).

  const book = await Book.findById(req.params.id).populate("author")
  try {
    if (book == null) {
      // No results.
      res.redirect("/catalog/books");
    }
    await Book.findByIdAndRemove(req.body.id, false)
    res.redirect("/catalog/books");

  } catch (error) {
    console.log(error.message); // 
  }
};

// Display book update form on GET.
exports.book_update_get = async (req, res, next) => {
  // Get book, authors for form.
  const details = Promise.all([
    Book.findById(req.params.id).populate("author"),
    Author.find()
  ]);
  try {
    const [book, authors] = await details;
    if (book == null) {
      // No results.
      const err = new Error("Book not found");
      err.status = 404;
      return next(err);
    }
    // Success.
    res.render("book_form", {
      title: "Update Book",
      authors: authors,
      book: book,
    });
  } catch (error) {
    console.log(error.message); // 
  }
};

// Handle book update on POST.
exports.book_update_post = [
  // Validate and sanitize fields.
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("author", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  // Process request after validation and sanitization.
  async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped/trimmed data and old id.
    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      try {
        // Get all authors for form
        const details = Promise.all([
          Author.find()
        ]);

        const [authors] = await details;
        console.log(authors)
        res.render("book_form", {
          title: "Update Book",
          authors: results.authors,
          book: book,
          errors: errors.array(),
        });
        return;

      } catch (error) {
        console.log(error.message); // 
      }
    } else {
      // Data from form is valid. Update the record.
      try {
        // ne pas mettre await et res.direct(url) serait faux !
        const {url} =  await Book.findByIdAndUpdate(req.params.id, book, {});
        console.log("kkkkkkkkkkkkkk")
        res.redirect(url);
      } catch (error) {
        console.log("ici" + error.message); // 
      }
    }
  },
];
