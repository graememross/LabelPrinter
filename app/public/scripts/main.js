

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
          ['insert', ['picture']]
        ]}
      });
    });

    var canvas = document.querySelector("canvas");

    document.querySelector("#print").addEventListener("click", function() {
      html2canvas(document.querySelector(".note-editable"), {canvas: canvas}).then(function(canvas) {
        console.log('Drew on the existing canvas');
        // print(canvas);
        sendImage(canvas);
      });
    }, false);
    var socket = io();
    socket.on('connect', function () { // TIP: you can avoid listening on `connect` and listen on events directly too!
        console.log('connected'); // data will be 'woot'
      });

    document.querySelector("#save").addEventListener("click", function(){
      console.log("emitting")
      socket.emit('template', { name: 'abc', template: 'def'});
    });

    function sendImage( theCanvas ){
      var url = theCanvas.toDataURL();
      socket.emit('printImage', { dataUrl: url });
    }
    
