// const { Socket } = require('socket.io');
const express = require('express');
const path = require('path');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const port = 3000;

server.listen(port, () => {
	console.log(`Server's running on port ${port}`);
});
app.use(express.static('public'));

app.get('/', (req, res) => {
	// res.sendFile(__dirname+'/public/index.html')
	res.sendFile(path.join(__dirname, 'public', 'index.html'))
});
// tech namespace...

app.get('/:roomType', (req, res) => {
	const roomType = req.params.roomType;
	const htmlContent = chatroomHTML(roomType);
	res.send(htmlContent);
})

function chatroomHTML(roomType) {
	console.log("chatRoom(roomtype) is being returned...");
 return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chatter : ${roomType} </title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet"
      integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">
    <style>
      form {
        padding: 20px;
        position: fixed;
        bottom: 0;
        width: 90%;
        padding-right: 50px;
      }
      #messages {
        list-style-type: none;
        margin: 0;
        padding: 0;
        width: 100%;
      }
      #messages li {
        padding: 5px 10px;
      }
      #messages li:nth-child(odd) {
        background-color: #eee;
      }
    </style>
  </head>
  <body>
    <div class="container-fluid">
      <div class="row">
        <ul id="messages"></ul>
      </div>
      <div class="row">
        <nav class="navbar navbar-light bg-light">
          <form class="form-inline" action="">
            <div class="input-group mb-3">
              <input id="m" autocomplete="off" class="form-control mr-sm-2" type="search"
                placeholder="Message..." aria-label="Message...">
              <button class="btn btn-outline-success my-2 my-sm-0" type="submit">Send</button>
            </div>
          </form>
        </nav>
      </div>
    </div>
    <script src="https://code.jquery.com/jquery-3.7.1.slim.min.js"
      integrity="sha256-kmHvs0B+OpCW5GVHUNjv9rOmY0IvSIRcf7zGUDTDQM8=" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"
      integrity="sha384-kenU1KFdBIe4zVF0s0G1M5b4hcpxyD9F7jL+jjXkk+Q2h455rYXK/7HAuoJl+0I4" crossorigin="anonymous"></script>
    <script src="/socket.io/socket.io.js"></script>
    <script>
      const room = '${roomType}';
      const socket = io('/tech');
      $('form').submit(() => {
        let msg = $('#m').val();
        socket.emit('message', { msg, room });
        $('#m').val('');
        return false;
      });
      socket.on('connect', () => {
        socket.emit('join', { room: room });
      });
      socket.on('message', (msg) => {
        $('#messages').append($('<li>').text(msg));
      });
    </script>
  </body>
  </html>
  `;
}

const tech = io.of('/tech')

tech.on('connection', (socket) => {
	socket.on('join', (data) => {	//rmndr: sct.ON >> LISTENING 2 n event
		//rmndr2: the 'data' on join is {room: room}
		socket.join(data.room);
		tech.in(data.room).emit('message', `New user joined ${data.room} room`); 				// tech.IN >> only on enterence to specific room
		//rmndr: look at the 1st rmndr here>>data is {room: room}
	})
	//"data" is used so 2 meet "socket.emit('message', {msg, room})";
	//contains both msg and room properties

	socket.on('message', (data) => {
		console.log(`message: ${data.msg}`);
		tech.in(data.room).emit('message', data.msg);
	});
	socket.on('disconnect', () => {
		console.log('user disconnected..');
		tech.emit('message', 'user disconnected.');
	})
}) 
