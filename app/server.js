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
      printers = ("Dummy-Printer\n"+stdout).trim().split('\n');
   });
app.use(express.static( "app/public/"));

var defaultSettings = {
  name:     'default',
  printer:  null,
  template: null,
  templates: []
};

// Pull back the default settings if they exist
theDb.settings.find({ name: 'default' }, function (err, docs) {
  // docs is an array containing documents Mars, Earth, Jupiter
  // If no document is found, docs is equal to []
  if ( docs.length === 0 ){
    theDb.settings.insert(defaultSettings, function(err){
      console.log(err);
    });
  } else {
    defaultSettings = docs[0];
  }
});

io.on('connection', function(socket){
//  console.log("Web client connected");
// Pull back the stored teplate names
  function refreshTemplates(){
    theDb.templates.find({}, function(err,docs){
      if ( ! err ){
       defaultSettings.templates = docs;
       updateClient();
     }
    });
  }
  function updateClient(){
    socket.emit('printers', {
      printers: printers,
      defaults: defaultSettings
    });
  }

  refreshTemplates();

  /**
  *  Save or update a templates
  * checks to see if it has already saved a templates* of the same name.
  *If so it updates it etherwise it insets it. I could have used "upsert" here maybe
  */
  socket.on('template', function(data){
    theDb.templates.find({name: data.name }, function(err,docs){
      console.log("err "+ err + " docs="+docs.length);
      if (  docs.length === 0 ){
        console.log("Insert template" + data.name);
        theDb.templates.insert(data, function(err){
          console.log(err);
          refreshTemplates();
        });
      } else {
        console.log("Update template");
        theDb.templates.update({ name: data.name}, data,{}, function(err){
          console.log('saved');
            refreshTemplates();
        });
      }
    });
  }); // listen to the event
  /*
  * Delete a named template (deletes all with the same name - no duplicates allowed)
  */
  socket.on('deltemplate', function(data){
    console.log("Deleting template "+ data.name);
    theDb.templates.remove({name: data.name},  { multi: true }, function(err,count) {
      console.log(count +" docs removed");
      refreshTemplates();
    });
  });
  /*
  *  saved a label a temporary png then calls the print routine on it
  */
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
      });
    }
  });

  /*
  * Update default settings
  */
  socket.on('defaults', function(data){
    defaultSettings.printer = data.printer;
    defaultSettings.template = data.template;
    console.log(defaultSettings);
    theDb.settings.update({ name: defaultSettings.name }, {
      name: defaultSettings.name,
      printer: defaultSettings.printer,
      template: defaultSettings.template
    },{}, function(err){
      console.log('saved');
    });
  });

});

http.listen(3020,"0.0.0.0",()=>{
  console.log("Well done, now I am listening...");
});
