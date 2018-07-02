

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
  var activePrinter = 'dummy'

  var socket = io();
  socket.on('connect', function () {
    console.log('connected');
  });

  socket.on('printers', function(printerConf){
    activePrinter = printerConf.defaults.printer;
    console.log(printerConf);
    for ( var s in printerConf.printers ){
      var checked = "";
      if ( printerConf.printers[s] == activePrinter ) {
        checked = "checked "
      }
      $('#printers').append('<label class="radio">'+
          '<input type="radio" name="optradio" onclick="selectPrinter(\''+
          printerConf.printers[s]+'\')" value="'+printerConf.printers[s]+'" '+checked+'>'+
          printerConf.printers[s]+'</label>');
    //  console.log(printerList[s]);
    }
  });

  function selectPrinter( p ){
    activePrinter = p;
    socket.emit('selectPrinter', { printer: p } );
  }
  function saveTemplate() {
    console.log("emitting")
    socket.emit('template', { name: 'abc', template: 'def'});
  }

  function sendImage( theCanvas ){
    var url = theCanvas.toDataURL();
    socket.emit('printImage', {
      printer: activePrinter,
      dataUrl: url
    });
  }

  function printImage() {
    document.querySelector(".note-editable").setAttribute("style", "background-color: white;");
    html2canvas(document.querySelector(".note-editable"), {canvas: canvas})
    .then(function(canvas) {
      console.log('Drew on the existing canvas');
      sendImage(canvas);
    });
    document.querySelector(".note-editable").setAttribute("style", "background-color: whitesmoke;");
  }
  function showPopover() {
    document.querySelector(".note-air-popover").setAttribute("style",
    "display: block; left: 25%; top:300px");
  }
