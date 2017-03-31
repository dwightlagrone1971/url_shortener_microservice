var express = require('express');
var path = require('path');
var mongo = require('mongodb').MongoClient;
var validUrl = require('valid-url');
// set instance of express
var app = express();
// set port 
var port = process.env.PORT;
// set database connection variable
var urldb = "mongodb://localhost:27017/shortner";
// connect to the database
mongo.connect(urldb, function(err, db) {
  
  if (err) {
    console.log("Connection was NOT successful!!");
  } else {
    console.log("Connect to database was successfull!");
  }
  
  // set path and view engine for ejs files
  app.use(express.static(path.join(__dirname, 'views')));
  app.set('view engine', 'ejs');
  // set route for home page
  app.get('/', function(req, res) {
    res.render('home');
  });
  // set route for shortener url
  app.get('/:url', function(req, res) {
    res.send("This is for the short URL redirect");
  });
  
  app.get('/new/:url*', function(req, res) {
  
  var url = req.params['url'] + req.params[0];
  
  console.log("User input url: " + url);
  
  checkForUrl(url);
  
    function checkForUrl(checkUrl) {
      
      console.log("This is inside the check for url function: " + url);  
      
      var sites = db.collection('sites');
      sites.find(
        {
        "longUrl" : checkUrl
        }, {
          "longUrl" : 1,
          "shortUrl" : 1,
          "_id" : 0
      }).toArray(function(err, data) {
        if (err) throw err;
        if (data.length > 0) {
          data = data[0];
          res.send(data);
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
          console.log("Great, the url is valid!" + valUrl);
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
      
      console.log(shortUrl);
      
      insertObj(url, shortUrl);
      
    }
    // create object longUrl and shortUrl
    function insertObj(orgUrl, shortUrl) {
      console.log("This is inside the create object function");
      console.log("longUrl: " + url + " " + "shortUrl: " + shortUrl);
      var sites = db.collection('sites');
      sites.insert({
        "shortUrl": shortUrl,
        "orginal_url" : orgUrl
      }, function(err, data) {
        if(err) throw err;
        if(data.length > 0) {
          data = data[0];
          console.log("Object save was a success! " + data.length);
        } else {
          console.log("Object did not save!! " + data.length);
        }
      });
    }  
 

    
    
    
  }); // end of app.get('/new/:url*'

  
  
  
}); // end of mongodb connection


app.listen(port, function() {
  console.log("Server is listening on port: " + port);
})