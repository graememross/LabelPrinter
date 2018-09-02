

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
    var originalTemplate = defaultSettings.template;
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
    if (defaultSettings.template !== originalTemplate ){
      useTemplate(defaultSettings.template);
    }
    setTemplates(defaultSettings.templates);
  });

  function setTemplates( templateList ){
    if (templateList){
      templates = templateList;
      $('#seltempl').empty();
      for ( var t in defaultSettings.templates ){
        var name = defaultSettings.templates[t].name;
        if (name){
          var selected="";
                if (name == defaultSettings.template)
                    selected = " selected";
                $('#seltempl').append('<option id=temp' + t + selected + '>' + name + '</option>');
            }
        }
        $("#seltempl").change(function () {
            var selected = $(this).children(":selected").text();
            doAction(selected);
        });
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

  function doAction(templatename){
    if (theAction === "delete") {
        for (var n in defaultSettings.templates) {
            if (defaultSettings.templates[n].name === name) {
                socket.emit('deltemplate', defaultSettings.templates[n]);
            }
        }
    } else {
      useTemplate(templatename);
      saveDefault();
    }
    theAction = 'use'; //always default back to using the template rather than Deleting
    document.querySelector('#defaultaction').checked = true;
  }
  function selectPrinter( p ){
    defaultSettings.printer = p;
    saveDefault();
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
  }
