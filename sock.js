'use strict';
const io = require('socket.io')();
let availableRooms = [];
let games = {};

io.on('connection', (socket) => {

  // receive readableName
  // check if someone is waiting
    // YES => join the room
    // NO => create a new room and wait


  // receive readableName from client
  socket.on('handshake++', (data) => {
    socket.readableName = data.name;
    if (availableRooms.length === 0) {
      let roomNo = '' + Date.now();
      availableRooms.push(roomNo);
      let game = {
        room: roomNo,
        p1: socket.id,
        p1r: socket.readableName,
        p2: null,
        p2r: '',
        playing: false
      };
      games[roomNo] = game;
      socket.join(roomNo, () => {
        socket.emit('checkin', game);
      });
    } else if (games[availableRooms[0]].p1r !== socket.readableName) {
      let roomNo = availableRooms.shift();
      games[roomNo].p2 = socket.id;
      games[roomNo].p2r = socket.readableName;
      socket.join(roomNo, () => {
        io.to(games[roomNo].p1).emit('game-on', {
          roomNo: roomNo,
          p1: games[roomNo].p1,
          p1r: games[roomNo].p1r,
          p2: games[roomNo].p2,
          p2r: games[roomNo].p2r
        });
        io.to(games[roomNo].p2).emit('game-on', {
          roomNo: roomNo,
          p2: games[roomNo].p1,
          p2r: games[roomNo].p1r,
          p1: games[roomNo].p2,
          p1r: games[roomNo].p2r
        });
      });
    }
  });
  // send ID to client
  socket.emit('handshake++', {
    id: socket.id
  });
});

module.exports = io;
