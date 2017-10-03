'use strict';
const io = require('socket.io')();
let availableRooms = [];
let games = {};
io.clients = {};

let createRoom = (socket) => {
  let room = '' + Date.now();
  availableRooms.push(room);
  games[room] = {
    id: room,
    players: []
  };
  return room;
};
let deleteRoom = (room) => {
  if (availableRooms.indexOf(room) !== -1) {
    availableRooms.splice(availableRooms.indexOf(room), 1);
  }
  if (games[room]) {
    io.to(room).emit('roomDestroy', room);
    delete games[room];
  }
};
let destroy = (socket) => {
  Objects.keys(socket.rooms).map((room) => {
    io.to(room).emit('destroy', socket.id);
  });
  io.clients[socket.id].disconnect(true);
  delete io.clients[socket.id];
};
let joinRoom = (socket) => {
  let room = availableRooms.shift() || createRoom(socket);
  socket.emit('joinRoom', room);
  games[room].players.push({
    name: socket.readableName,
    id: socket.id,
    score: 0
  });
  socket.join(room);
  if (games[room].players.length === 2) {
    io.to(room).emit('roomFull', games[room]);
  }
  return room;
};

let connect = (socket) => {
  socket.on('handshake++', (data) => {
    socket.emit('handshake++', socket.id);
    socket.readableName = data;
    io.clients[socket.id] = socket;
    let room = joinRoom(socket);
    socket.on('disconnect', function() {
      let id = socket.id;
      io.clients[socket.id].disconnect(true);
      delete io.clients[socket.id];
      games[room].players.map((player) => {
        if (player.id === id) {
          player = null;
        } else {
          io.to(player.id).emit('disco', games[room]);
        }
      });
    });
  });
};

io.on('connection', (socket) => {
  connect(socket);
});

module.exports = io;
