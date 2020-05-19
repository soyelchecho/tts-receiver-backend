var socket = io();
var mensajesVoz = [];

var primero = true;
var tiempoEspera = 0

function prueba1(){
  if(mensajesVoz.length > 0){
    auxiliar = 0;
    for(var i = auxiliar; i < mensajesVoz.length; i=i+0){
      var index = mensajesVoz.indexOf(mensajesVoz[i]);
      if (index > -1) {
        reproducirMensaje(mensajesVoz[i])
        mensajesVoz.splice(index, 1);
      }
    }
  }else{
    primero = true;
  }
}


socket.on('messages', function(data) {
  reproducirMensaje(data);
})

async function reproducirMensaje(data){
  await render(data);
}

async function render (data) {
  var duracionMensaje;
  var nombre;
  var html = data.map(function(elem, index) {
    duracionMensaje = elem.duracion;
    nombre = "mensaje"+elem.id+".ogg";
    return(`<div id = "mensajeAlerta">
              <div id="messages">
                <div class="Message" id="js-timer">
                  <div class="Message-body">
                    <p align="center">${elem.autor}</p>
                    <p align="center">${elem.mensaje}</p>
                  </div>
                </div>
              </div>
              <div id ="contenedorMensaje">
                <audio id="AudioMensaje" autoplay>
                  <source src="mensaje${elem.id}.ogg" type="audio/ogg">
                </audio>
              </div>
            </div>`);
  }).join(" ");
   document.getElementById('messagesContainer').innerHTML = "";
   document.getElementById('messagesContainer').innerHTML = html;
   var tiempo = duracionMensaje*1000 +4000;
   borrarDelta(tiempo,nombre);
   return;
}

function borrarDelta(tiempo,nombre){
  setTimeout(function(){
    $('#mensajeAlerta').remove();
    socket.emit('borrarAudio',nombre);
  }, tiempo);
}

function addMessage(e) {
  var message = {
    author: document.getElementById('username').value,
    text: document.getElementById('texto').value
  };

  socket.emit('new-message', message);
  return false;
}
