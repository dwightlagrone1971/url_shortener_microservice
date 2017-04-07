var express = require('express');
var path = require('path');
var validUrl = require('valid-url');
var router = express.Router();
var mongo = require('mongodb').MongoClient;
  require('dotenv').config({
    silent: true
  });
  

var app = express();

var port = process.env.PORT;
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');

var dbUrl = 'mongodb://localhost:27017/shortner';

mongo.connect(dbUrl, function(err, db) {
  
  if (err) {
    console.log("Connection to the database failed!!");
  } else {
    console.log("Connection to the database was successfull!");
  }
  
  app.get('/', function(req, res) {
    res.render('home');
  });
  
  app.get('/:url*', function(req, res) {
    
    var url = req.params['url'] + req.params[0]; 
    console.log("The url is: " + url);
    
    var urlSlice = url.slice(-4, -3);
    console.log("The urlSlice var is: " + urlSlice);
    var orginalUrl = url.slice(0, -4);
    console.log("The original short url is: " + orginalUrl);
    
    if (urlSlice == "/") {
      var findShortUrl = db.collection('sites');
      findShortUrl.find(
        {
          "shortUrl" : url
        }, {
          "shortUrl" : 1,
          "longUrl" : 1,
          "_id" : 0
      }).toArray(function(err, data) {
        if(err) throw err;
        if(data.length > 0) {
          data = data[0];
          console.log("longUrl is: " + data.longUrl);
          console.log("shortUrl is: " + data.shortUrl);
          res.redirect(data.longUrl);
        } else {
          console.log("This url " + url + " in the database!!");
        }
      });
    } else if (urlSlice !== "/") {
      ValidURL(url);
    }
    
    // check if url is valid: stack overflow - kavitha Reddy
    function ValidURL(str) {
        var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
        if(!regex .test(str)) {
            console.log("Please enter valid URL!!");
        } else {
          console.log("Great, the url is valid!");
          var findLongUrl = db.collection('sites');
          findLongUrl.find(
          {
            "longUrl" : str
          }, {
            "longUrl" : 1,
            "shortUrl" : 1,
            "_id" : 0
          }).toArray(function(err, data) {
            if(err) throw err;
            if (data.length > 0) {
              data = data[0];
              res.send(data);
            } else {
              makeShortUrl();
            }
          });
        }
      }
    
    // check if url is valid: stack overflow - SteveP
    function makeShortUrl() {
      
      var text = "";
      var charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

      for( var i=0; i < 5; i++ )
        text += charset.charAt(Math.floor(Math.random() * charset.length));
      
      var newUrl = "https://www." + text + ".com";
      
      randParam(newUrl);
      
    }
    
    // check if url is valid: stack overflow - SteveP
    function randParam(baseUrl) {
      
      var numb = "";
      var numbSet = "0123456789";
      
      for( var i=0; i < 4; i++ )
        numb += numbSet.charAt(Math.floor(Math.random() * numbSet.length));
        
        var finalShortUrl = baseUrl + "/" + numb;
        
        console.log(finalShortUrl);
    
    }
    
   
  
    
    
    
    
    
  });
  

  
  
  
  
 

}); // end of mongo db connection

app.listen(port, function() {
  console.log("Server is listening on port: " + port);
});

