#! /usr/bin/env node

console.log('This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);

var async = require('async')
var Book = require('./models/book')
var Author = require('./models/author')


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const authors = []
, books = [];

async function authorCreate(first_name, family_name, d_birth, d_death) {
  authordetail = {first_name:first_name , family_name: family_name }
  if (d_birth != false) authordetail.date_of_birth = d_birth
  if (d_death != false) authordetail.date_of_death = d_death
  
  

  try {
    const author = new Author(authordetail);
    console.log('before save');
    let saveAuthor = await author.save(); //when fail its goes to catch
    console.log(saveAuthor); //when success it print.
    authors.push(author)
    console.log('after save');
  } catch (err) {
    console.log('err' + err);

  }
}



async function bookCreate(title, summary, isbn, author) {
  bookdetail = { 
    title: title,
    summary: summary,
    author: author,
    isbn: isbn
  }
  try {
    const book = new Book(bookdetail);   
    console.log('before save');
    let saveBook = await book.save(); //when fail its goes to catch
    console.log(saveBook); //when success it print.
    books.push(saveBook);
    console.log('after save');
  } catch (err) {
    console.log('err' + err);

  }
}



async function createAuthors(){

  return Promise.all([
    authorCreate('Denis', 'DUPONT', '02-09-1965', false),
    authorCreate('BOB', 'Synclair', '12-12-1963', '12-12-2022')
]) 
}


async function createBooks(){
  return Promise.all([
          bookCreate('Le CSS en action', 'GRID / FLEX en action', '111111111111', authors[0]),
          bookCreate('Le Rock par la pratique', 'Devenez danceur de saloom', '222222222222', authors[1]),
          bookCreate('Le JS en action', "Les closures n'ont plus de secret", 'xxxxxxxxxxxx', authors[1])
  ])
}

async function createDB() {
  await createAuthors();
  await createBooks();

  mongoose.connection.close();
}

createDB();