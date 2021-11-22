'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const app = express();
const pug = require('pug');
const mongoose = require('mongoose');
const BookModel = require('./models/BookModel');
const CommentModel = require('./models/CommentModel');
const helmet = require('helmet');
// const apiRoutes = require('./routes/api');
// const runner = require('./test-runner');

mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true });
app.set('view engine', 'pug');
app.use('/public', express.static(process.cwd() + '/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(helmet.hidePoweredBy({ setTo: 'PHP 4.2.0' }))

//Index page (static HTML)
app.route('/')
  .get(function (req, res) {

    res.render(process.cwd() + '/views/index.pug');

  });

app.get('/Profile', (req, res) => {
  BookModel.find({}, (err, data) => {
    if (err) {
      res.json({ error: err })
    }
    else {
      CommentModel.find({}, (err, commentdata) => {
        if (err) {
          res.json({ error: err })
        }
        else {
          let content = data.map(book => {
            let obj = {
              id: book._id,
              title: book.title,
              comments: commentdata.filter(comment => comment.reference == book.title)
                .map(comment => comment.text)
            }
            return obj
          })
          console.log(content);
          res.render(process.cwd() + '/views/Profile.pug', { books: content });
        }
      })
    }
  })

})


app.post('/api/books', (req, res) => {
  console.log(req.body.bookTitle)
  const NewBook = new BookModel({
    title: req.body.bookTitle
  })
  NewBook.save((err, data) => {
    if (err) {
      res.json({ "message": err })
    } else {
      console.log(data)
      res.redirect('/Profile')
    }
  })
})

app.post('/api/books/comment', (req, res) => {
  BookModel.find({ title: req.body.bookid }, (err, data) => {
    if (err) {
      res.json({ "error": err })
    } else {
      console.log(data)
      if (data == undefined) {
        res.json({ message: "No Book Exist" })
      } else {
        const NewComment = new CommentModel({
          text: req.body.comment,
          reference: req.body.bookid
        })
        NewComment.save((err, done) => {
          if (err) {
            res.json({ "error": err })
          } else {
            res.redirect('/Profile')
          }
        })
      }
    }
  })
})

// delete book and comment
app.get('/api/books/delete/:bookToDelete', (req, res) => {
  let theBook = req.params.bookToDelete;
  BookModel.findByIdAndDelete({ _id: theBook }, (err, data) => {
    if (err) {
      res.json({ "error": err })
    } else {
      console.log(data.title)
      let theComment = req.params.reference;
      CommentModel.deleteMany({ reference: data.title }, (err, comm) => {
        if (err) {
          res.json({ "error": err })
        } else {
          console.log(comm)
          res.redirect('/Profile')
        }
      })

    }
  })
})


// delete all books from database
app.post('./api/deleteAll', (req, res) => {
  BookModel.remove({}, (err, data) => {
    if (err) {
      res.json({ "error": err })
    } else {
      console.log(data)
      CommentModel.remove({}, (err, comm) => {
        if (err) {
          res.json({ "error": err })
        } else {
          res.redirect('/')
        }
      })
    }
  })
})

//Routing for API 
// apiRoutes(app);  

//404 Not Found Middleware
app.use(function (req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

//Start our server and tests!
app.listen(process.env.PORT || 3000, function () {
  console.log("Listening on port " + process.env.PORT);
  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        // runner.run();
      } catch (e) {
        let error = e;
        console.log('Tests are not valid:');
        console.log(error);
      }
    }, 1500);
  }
});

module.exports = app; //for unit/functional testing
