var express = require('express');
var path = require('path');
var mongo = require('mongodb').MongoClient;
require('dotenv').config({
  silent: true
});

// set instance of express
var app = express();
// set port 
var port = process.env.PORT;
// set database connection variable
var urldb = "mongodb://localhost:27017/shortner";
// connect to the database
mongo.connect(process.env.MONGOLAB_URI || urldb, function(err, db) {
  
  if (err) {
    console.log("Connection was NOT successful!!");
  } else {
    console.log("Connect to database was successfull!");
  }
  
  // set path and view engine for ejs files
  app.use(express.static(path.join(__dirname, 'public')));
  app.set('view engine', 'ejs');
  // set route for home page
  
  app.get('/', function(req, res) {
    res.render('home');
  });
  
  app.get('/orig/:url*', function(req, res) {
  
    var url = req.params['url'] + req.params[0];
  
    checkForUrl(url);
  
    function checkForUrl(checkUrl) {
      
      var sites = db.collection('sites');
      sites.find(
      {
        "orginal_url" : checkUrl
      }, {
        "orginal_url" : 1,
        "shortUrl" : 1,
        "_id" : 0
      }).toArray(function(err, data) {
        if (err) throw err;
          if (data.length > 0) {
            data = data[0];
            res.send(data);
            var shortyUrl = data.shortUrl;
          } else {
            validateUrl(checkUrl);
          }
      });
    }
    // check if url is valid: stack overflow - kavitha Reddy
    function validateUrl(valUrl) {
      
      var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
        if(!regex .test(valUrl)) {
          console.log("Please enter valid URL!!");
        } else {
          console.log("Great, the url is valid! " + valUrl);
          makeShortUrl(valUrl);
        }
    }
    // make short url: stack overflow - SteveP
    function makeShortUrl() {
      
      var text = "";
      var charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

      for( var i=0; i < 5; i++ )
        text += charset.charAt(Math.floor(Math.random() * charset.length));
      
      var shortUrl = "https://www." + text + ".com";
      
      insertObj(url, shortUrl);
      
    }
    // create object longUrl and shortUrl
    function insertObj(orgUrl, shortUrl) {
      var sites = db.collection('sites');
      sites.insert({
        "shortUrl": "http://camper-api-project-dlagrone1971.c9users.io/short/" + shortUrl,
        "orginal_url" : orgUrl
      }, function(err, data) {
        if(err) throw err;
        console.log("The object saved in the database");
        checkForUrl(orgUrl);
      });
    } 
      
      
  }); // end of app.get('/new/:url*'

  // set route for shortener url
  app.get('/:url*', function(req, res) {
    
    var url = req.params['url'] + req.params[0];
    var fullUrl = "http://camper-api-project-dlagrone1971.c9users.io/" + url;
    
    console.log("this is in the short route: " + fullUrl);
    
    var sites = db.collection('sites');
    sites.find(
      {
        "shortUrl" : fullUrl
      }).toArray(function(err, data) {
        if (err) throw err;
        if(data.length > 0) {
          data = data[0];
          console.log("Found: " + data.shortUrl);
          ("Redirecting to: " + data.orginal_url);
          res.redirect(data.orginal_url);
        } else {
          res.send("There was a problem with you data search!!");
        }
      });
    
    
  });
  
  
}); // end of mongodb connection


app.listen(port, function() {
  console.log("Server is listening on port: " + port);
})