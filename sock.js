'use strict';
const io = require('socket.io')();
let availableRooms = [];
let games = {};

let createRoom = (socket) => {
  let room = '' + Date.now();
  availableRooms.push(room);
  games[room] = {
    id: room,
    players: []
  };
  return room;
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
    joinRoom(socket);
  });
};
io.on('connection', (socket) => {
  connect(socket);
});

module.exports = io;
