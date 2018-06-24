var express = require("express");
var app = express();

var http = require("http").createServer(app);
//var path = require('path');
var io = require("socket.io")(http);
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
  //  socket.emit('request', /* */); // emit an event to the socket
  //  io.emit('broadcast', /* */); // emit an event to all connected sockets
  console.log("Web client connected");
  socket.on('template', function(data){
    console.log(data);
    var aTemplate =new Templates(data);
    console.log(aTemplate);
  }); // listen to the event
  //  socket.on('print', function(){ /* */ }); // listen to the event
  socket.on('printImage', function(data){
    console.log(data);
  });
  //ss(socket).on('print', function(stream) {
  //    console.log("Receiving stream");
  //  stream.pipe(fs.createWriteStream("test.png"));
  //});
});

http.listen(3020,()=>{
  console.log("Well done, now I am listening...");

});
