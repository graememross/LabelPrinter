

$(document).ready(function() {
  $('#summernote').summernote( {
    airMode: true,
    popover: {
      air: [
        ['color', ['color']],
        ['font', ['bold', 'underline', 'clear']],
        ['fontsize', ['fontsize']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['table', ['table']],
        ['height',['height']],
        ['insert', ['picture']]
      ]}
    });
    document.querySelector(".note-editable").addEventListener('click', showPopover );
    document.querySelector(".note-editable").addEventListener('mouseover', showPopover );
  });

  var canvas = document.querySelector("canvas");

  var defaultSettings = {
    name:     'default',
    printer:  null,
    templates: [],
    template: null
  };

  var socket = io();
  socket.on('connect', function () {
    //console.log('connected');
  });

  /**
  * On connection and whenever it changes the createServer
  * sends
  * 1. list of the systems printers
  * 2. An array of the previously created Templates
  * 3. The currently set defaults
  */
  socket.on('printers', function(printerConf){
    defaultSettings = printerConf.defaults;
    $('#printers').empty();
    for ( var s in printerConf.printers ){
      var checked = "";
  //    console.log( printerConf.printers[s]+ "["+s+"] === "+ activePrinter);
      if ( printerConf.printers[s] === defaultSettings.printer ) {
        checked = "checked "
    //    console.log( activePrinter + " checked");
      }

      $('#printers').append('<label class="radio">'+
          '<input type="radio" name="optradio" onclick="selectPrinter(\''+
          printerConf.printers[s]+'\')" value="'+printerConf.printers[s]+'" '+checked+'>'+
          printerConf.printers[s]+'</label>');
    //  console.log(printerList[s]);
    }
    if (defaultSettings.template){
      useTemplate(defaultSettings.template);
    }
    setTemplates(defaultSettings.templates);
  });

  function setTemplates( templateList ){
    if (templateList){
      templates = templateList;
      $('#seltempl').empty();
      for ( var t in defaultSettings.templates ){
        if (defaultSettings.templates[t].name){
          $('#seltempl').append(
          '<option onclick="doAction('+t+')">'+defaultSettings.templates[t].name+'</option>')
        }
      }
    }
  }

  function saveDefault(){
    socket.emit('defaults', {
      printer:  defaultSettings.printer,
      template: defaultSettings.template
    });
  }

  function useTemplate(name){
    for ( var n in defaultSettings.templates){
      if ( defaultSettings.templates[n].name === name ){
        $(".note-editable").empty();
        $(".note-editable").append(defaultSettings.templates[n].template);
        document.querySelector('#template-name').value = defaultSettings.templates[n].name;
        defaultSettings.template = defaultSettings.templates[n].name;
        enableSave();
        return;
      }
    }
  };

  function saveTemplate() {
    var html = document.querySelector(".note-editable").innerHTML;
    var name = document.querySelector('#template-name').value;
    socket.emit('template', { name: name, template: html});
  }

  function enableSave(){
    document.querySelector("#save").disabled = false;
  }

  var theAction = 'use';
  function selectAction( action ){
    theAction =action;
  }

  function showPopover() {
    document.querySelector(".note-air-popover").setAttribute("style",
    "display: block; left: 25%; top:300px");
  }

  function doAction(templatenum){
    if ( theAction === "delete"){
      socket.emit('deltemplate', defaultSettings.templates[templatenum]);
    } else {
      useTemplate(defaultSettings.templates[templatenum].name);
      saveDefault();
    }
    theAction = 'use'; //always default back to using the template rather than Deleting
    document.querySelector('#defaultaction').checked = true;
  }
  function selectPrinter( p ){
    defaultSettings.printer = p;
    saveDefaults();
  }

  function sendImage( theCanvas ){
    var url = theCanvas.toDataURL();
    socket.emit('printImage', {
      printer: defaultSettings.printer,
      dataUrl: url
    });
  }

  function printImage() {
    document.querySelector(".note-editable").setAttribute("style", "background-color: white;");
    html2canvas(document.querySelector(".note-editable"), {canvas: canvas})
    .then(function(canvas) {
  //    console.log('Drew on the existing canvas');
      sendImage(canvas);
    });
    document.querySelector(".note-editable").setAttribute("style", "background-color: whitesmoke;");
  }
