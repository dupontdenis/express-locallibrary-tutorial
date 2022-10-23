const Author = require("../models/author");
const Book = require("../models/book");

const { body, validationResult } = require("express-validator");

// Display list of all Authors.
exports.author_list = async (req, res, next) => {
  try {
    const list_authors = await Author.find()
      .sort([["family_name", "ascending"]])

    res.render("author_list", {
      title: "Author List",
      author_list: list_authors
    });
  } catch (error) {
    console.error(error);
  }
};

// Display detail page for a specific Author.
exports.author_detail = async (req, res, next) => {
  try {
  const details = Promise.all([
    Author.findById(req.params.id),
    Book.find({ author: req.params.id }, "title summary")
  ]);
    // wait...
    const [author, author_books] = await details;
    console.log(author)
    if (author == null) {
      // No results.
      const err = new Error("Author not found");
      err.status = 404;
      return next(err);
    }
    // Successful, so render.
    res.render("author_detail", {
      title: "Author Detail",
      author: author,
      author_books: author_books,
    });
  } catch (error) {
    console.log(error.message); // 
  }
};

// Display Author create form on GET.
exports.author_create_get = async (req, res, next) => {
  res.render("author_form", { title: "Create Author" });
};

// Handle Author create on POST.
exports.author_create_post = [
  // Validate and sanitize fields.
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters."),
  body("family_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Family name must be specified.")
    .isAlphanumeric()
    .withMessage("Family name has non-alphanumeric characters."),
  body("date_of_birth", "Invalid date of birth")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  body("date_of_death", "Invalid date of death")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization.
  async (req, res, next) => {

    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create Author object with escaped and trimmed data
    const author = new Author({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render("author_form", {
        title: "Create Author",
        author: author,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.
      try {
        const { url } = await author.save()
        // Successful - redirect to new author record.
        res.redirect(url);

      }
      catch (error) {
        console.error(error);
      }
    }
  },
];

// Display Author delete form on GET.
exports.author_delete_get = async (req, res, next) => {
  
  try {
  const details = Promise.all([
    Author.findById(req.params.id),
    Book.find({ author: req.params.id })
  ]);
    // wait...
    const [author, author_books] = await details;
    if (author == null) {
      // No results.
      res.redirect("/catalog/authors");
    }
    console.log(author)
    // Successful, so render.
    res.render("author_delete", {
      title: "Delete Author",
      author: author,
      author_books: author_books,
    });

  } catch (error) {
    console.log(error.message); // 
  }
};

// Handle Author delete on POST.
exports.author_delete_post = async (req, res, next) => {

  const details = Promise.all([
    Author.findById(req.body.authorid),
    Book.find({ author: req.body.authorid })
  ]);
  try {
    // wait...
    const [author, author_books] = await details;
    if (author_books.length > 0) {
      // Author has books. Render in same way as for GET route.
      res.render("author_delete", {
        title: "Delete Author",
        author: author,
        author_books: author_books,
      });
      return;
    } else {
      // Author has no books. Delete object and redirect to the list of authors., 


      await Author.findByIdAndRemove(req.body.authorid);

      // Success - go to author list.
      res.redirect("/catalog/authors");
    }

  } catch (error) {
    console.log(error.message); // 
  }

  // async.parallel(
  //   {
  //     author: function (callback) {
  //       Author.findById(req.body.authorid).exec(callback);
  //     },
  //     authors_books: function (callback) {
  //       Book.find({ author: req.body.authorid }).exec(callback);
  //     },
  //   },
  //   function (err, results) {
  //     if (err) {
  //       return next(err);
  //     }
  //     // Success.
  //     if (results.authors_books.length > 0) {
  //       // Author has books. Render in same way as for GET route.
  //       res.render("author_delete", {
  //         title: "Delete Author",
  //         author: results.author,
  //         author_books: results.authors_books,
  //       });
  //       return;
  //     } else {
  //       // Author has no books. Delete object and redirect to the list of authors.
  //       Author.findByIdAndRemove(req.body.authorid, function deleteAuthor(err) {
  //         if (err) {
  //           return next(err);
  //         }
  //         // Success - go to author list.
  //         res.redirect("/catalog/authors");
  //       });
  //     }
  //   }
  // );
};

// Display Author update form on GET.
exports.author_update_get = async (req, res, next) => {
  try {
    const author = await Author.findById(req.params.id);
    if (author == null) {
      // No results.
      const err = new Error("Author not found");
      err.status = 404;
      return next(err);
    }
    // Success.
    res.render("author_form", { title: "Update Author", author: author });

  } catch (error) {
    return next(error);
  }
}

// Handle Author update on POST.
exports.author_update_post = [
  // Validate and santize fields.
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters."),
  body("family_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Family name must be specified.")
    .isAlphanumeric()
    .withMessage("Family name has non-alphanumeric characters."),
  body("date_of_birth", "Invalid date of birth")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  body("date_of_death", "Invalid date of death")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization.
  async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create Author object with escaped and trimmed data (and the old id!)
    const author = new Author({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values and error messages.
      res.render("author_form", {
        title: "Update Author",
        author: author,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      const theauthor = await Author.findByIdAndUpdate(req.params.id, author, {});
      res.redirect(theauthor.url);
    }
  },
];
