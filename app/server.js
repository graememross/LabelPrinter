var express = require("express");
var app = express();

var http = require("http").createServer(app);
//var path = require('path');
var io = require("socket.io")(http);
var fs = require('fs');

//var ss = require("socket.io-stream");

var mongoose = require("mongoose");
var Templates = require("./models/Templates");

app.use(express.static( "app/public/"));

var conString = "mongodb://localhost:27017/dymoprint";
mongoose.connect(conString).then(
  () => {
    console.log("Connected to database");
  },
  (err) => {
    console.log("Some error occured "+err)
  }
)

io.on('connection', function(socket){
  console.log("Web client connected");
  socket.on('template', function(data){
    var aTemplate =new Templates(data);
    console.log(aTemplate);
  }); // listen to the event
  //  socket.on('print', function(){ /* */ }); // listen to the event
  const STARTER = 'data:image/png;base64,';
  socket.on('printImage', function(data){
  //  console.log(data);
    if ( data.dataUrl.startsWith(STARTER)){
      var buf = Buffer.from(data.dataUrl.substr(STARTER.length), 'base64');
      fs.writeFile('label.png',buf, function (err) {
        if (err) throw err;
        console.log('Label created on disk!');
      })
      console.log("created binary buf")
    }
  });
});

http.listen(3020,()=>{
  console.log("Well done, now I am listening...");
});
