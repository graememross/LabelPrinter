var express = require("express");
var app = express();

var http = require("http").createServer(app);
var io = require("socket.io")(http);
var fs = require('fs');
var theDb = require('./controllers/dbase');

//var mongoose = require("mongoose");
//var Templates = require("./models/Templates");
var exec = require('child_process').exec;

var printers = [];
// get the system printers
var child = exec("lpstat -a | cut -d' ' -f1",
   function (error, stdout, stderr) {
      if (error !== null) {
        console.log('stderr: ' + stderr);
        console.log('exec error: ' + error);
      }
      printers = ("Dummy-Printer\n"+stdout).trim().split('\n')
   });
app.use(express.static( "app/public/"));

//var conString = "mongodb://localhost:27017/dymoprint";
//mongoose.connect(conString).then(
//  () => {
//    console.log("Connected to database");
//  },
//  (err) => {
//    console.log("Some error occured "+err)
//  }
//)
var defaultSettings = {
  name:     'default',
  printer:  printers[0]
};
// Pull back the default settings if they exist
theDb.settings.find({ name: 'default' }, function (err, docs) {
  // docs is an array containing documents Mars, Earth, Jupiter
  // If no document is found, docs is equal to []
  if ( docs.length == 0 ){
    theDb.settings.insert(defaultSettings, function(err){
      console.log(err);
    });
  } else {
    defaultSettings.printer = docs[0];
  }
});

io.on('connection', function(socket){
//  console.log("Web client connected");
  socket.emit('printers', {
    printers: printers,
    defaults: defaultSettings
  });
  socket.on('template', function(data){
    //var aTemplate =new Templates(data);
    console.log(data);
  }); // listen to the event
  //  socket.on('print', function(){ /* */ }); // listen to the event
  const STARTER = 'data:image/png;base64,';
  socket.on('printImage', function(data){
  //  console.log(data.dataUrl)
    if ( data.dataUrl.startsWith(STARTER)){
      var buf = Buffer.from(data.dataUrl.substr(STARTER.length), 'base64');
      fs.writeFile('label.png',buf, function (err) {
        if (err) throw err;
        console.log('Label created on disk!');

        var child = exec("lpr -P "+data.printer+" label.png",
           function (error, stdout, stderr) {
              if (error !== null) {
                console.log('stderr: ' + stderr);
                console.log('exec error: ' + error);
              }
           });
      })
    }
  });
  socket.on('selectPrinter', function(data){
    defaultSettings.printer = data.printer;
    console.log(defaultSettings);
    theDb.settings.update({ name: 'default'}, defaultSettings,{}, function(err){
      console.log('saved');
    });
  });
  socket.on('listPrinters', function(){});
});

http.listen(3020,"0.0.0.0",()=>{
  console.log("Well done, now I am listening...");
});
