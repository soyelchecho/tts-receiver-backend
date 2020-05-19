//ZONA DE IMPORTACIONES DEPENDENCIAS

const express = require('express');
const request = require('request');
const fs      = require('fs');
const { getAudioDurationInSeconds } = require('get-audio-duration')
var bodyParser = require('body-parser');
const io = require('socket.io');
const path = require('path');
const http = require('http')




// FIN ZONA DE IMPORTACIONES DEPENDENCIAS


// DEFINICIONES

const app = express()
const server = http.createServer(app);
app.set('port', (process.env.PORT || 5000));
var sockets = io.listen(server);
var numeroMensaje = 0;
var mensajeActual = 0;
var messages = [];
var reproduciendoActualmente = -1;
var absolute_path = __dirname;
var reproduciendo = false;


// USOS Y SETS
//app.use('/css',express.static('css'));
//app.use(express.static("public"));


//app.use('ejs', express.static(__dirname + 'views')); // Permitimos cargar las paginas de vista
//app.set('view engine', 'ejs');
//app.set('views', [__dirname + '../views']);
app.use(bodyParser.urlencoded({extended:true})); // Permitimos el transpaso del body cuando hacemos un POST con cosas pesadas
app.use(bodyParser.json()); // for parsing application/json


// FIN USO Y SETS

/*
app.get('/', function(req, res){
   res.sendFile(__dirname+ 'public/index.html');
});*/

var temp_dir = path.join(process.cwd(), 'temp/');

if (!fs.existsSync(temp_dir)){
  console.log(temp_dir);
  fs.mkdirSync(temp_dir);
}

var temp_dirPublic = path.join(process.cwd(), 'public/');

if (!fs.existsSync(temp_dirPublic)){
      fs.mkdirSync(temp_dirPublic);
}
app.use(express.static(__dirname + '/public'));

sockets.on('connection', function(socket) {
    console.log('un nuevo usuario conectado');
    socket.on('mensaje-del-cliente', function(data) {
        sockets.emit('mensaje-del-servidor', data);
    });
    socket.on('new-message', function(data) {
      io.sockets.emit('messages', data);
    });
    socket.on('borrarAudio', function(data) {
      messages.shift();
      fs.unlink(temp_dirPublic + data, (err) => {
        if (err) {
          console.error(err)
          return
        }
      })
      reproduciendo = false;
    });

});

app.post('/',function(req,res,next){
  console.log(req.body.mensaje)
  request.post({url:'https://streamlabs.com/polly/speak', form: {voice:req.body.voz,text:req.body.mensaje}}, function(err,httpResponse,body){
     urlSonido = JSON.parse(body).speak_url;
     mensaje = request.get(urlSonido).on('response', function(response) {})
     .pipe(fs.createWriteStream(temp_dirPublic + 'mensaje'+numeroMensaje+'.ogg'));

     mensaje.on('finish', function () {
       getAudioDurationInSeconds(temp_dirPublic + 'mensaje'+numeroMensaje+'.ogg').then((duration) => {
         duracionMensaje = duration;
         var message =[{
           id: numeroMensaje,
           mensaje:req.body.mensaje,
           autor: req.body.autor,
           duracion: duration
         }];
         messages.push(message)
         reproducirMensajes(message);
       })
     });
  })
  res.sendStatus(200);
});

var tiempoEspera = 10000
async function reproducirMensajes(message){
  if(reproduciendo == false){
    reproduciendo = true;
    tiempoEspera = message[0].duracion*1000 +4000
    reproduciendoActualmente++;
    sockets.emit('messages', message);
    numeroMensaje = numeroMensaje +1;
  }else{
    await sleep(tiempoEspera);
    reproducirMensajes(message);
  }
}
function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}

server.listen(app.get('port'), function() {
  console.log("Servidor corriendo en" + process.env.PORT);
});
