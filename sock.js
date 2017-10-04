'use strict';

const io = require('socket.io')();

let newGame = (function() {
  let Game = function(id) {
    this.id = id;
    this.players = {};
    this.count = 0;
  };
  Game.prototype.addPlayer = function(socket) {
    this.players[socket.id] = {
      id: socket.id,
      name: socket.readableName,
      score: 0
    };
    this.count += 1;
  };
  Game.prototype.removePlayer = function(id) {
    delete this.players[id];
    this.count -= 1;
  };
  return function(id) {
    return new Game(id);
  };
}());

let clients = {};
global.players = [];
let availableRooms = [];
let games = {};

let createRoom = () => {
  let room = '' + Date.now();
  availableRooms.push(room);
  games[room] = newGame(room);
  return room;
};
let joinRoom = (socket) => {
  let room = availableRooms.shift() || createRoom();
  socket.join(room);
  socket.emit('joinRoom', room);
  games[room].addPlayer(socket);
  if (games[room].count === 2) {
    io.to(room).emit('roomFull', games[room]);
  }
  return room;
};
let connect = (socket) => {
  socket.on('handshake++', (data) => {
    socket.emit('handshake++', socket.id);
    socket.readableName = data;
    clients[socket.id] = socket;
    let room = joinRoom(socket);
    let index = global.players.push(socket.readableName) - 1;
    console.log('Clients connected', Object.keys(clients).length);
    socket.on('disconnect', function() {
      global.players.splice(index, 1);
      console.log(index, global.players);
      socket.to(room).emit('disco', socket.id);
      games[room].removePlayer(socket.id);
      cleanRoom(room);
      destroy(socket.id);
    });
  });
};

let cleanRoom = (room) => {};
let destroy = (socket) => {
  delete clients[socket];
};

io.on('connection', (socket) => {
  connect(socket);
});

module.exports = io;
