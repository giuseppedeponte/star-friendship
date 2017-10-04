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
let availableRooms = [];
let games = {};

let stat = (callee) => {
  console.log(callee + ' - Clients: ', Object.keys(clients).length);
  console.log(callee + ' - AvRooms: ', availableRooms);
  console.log(callee + ' - Games: ', Object.keys(games).length);
  console.log(callee + ' - Players: ', global.players);
}

let createRoom = () => {
  let room = '' + Date.now();
  availableRooms.push(room);
  games[room] = newGame(room);
  return room;
};
let joinRoom = (socket) => {
  let room = availableRooms.shift() || createRoom();
  if (socket.rooms[room]) {
    return room;
  }
  socket.join(room);
  socket.emit('joinRoom', room);
  games[room].addPlayer(socket);
  if (games[room].count === 2) {
    io.to(room).emit('roomFull', games[room]);
  }
  return room;
};
let cleanRoom = (room) => {
  if (games[room].count === 0) {
    let ind = availableRooms.indexOf(room);
    if (ind >= 0) {
      availableRooms.splice(ind, 1);
    }
    delete games[room];
  }
};
let destroy = (socket) => {
  delete clients[socket];
};
let connect = (socket) => {
  socket.on('handshake++', (data) => {
    stat('handshake');
    socket.emit('handshake++', socket.id);
    console.log('---' + data + '---');
    socket.readableName = data;
    clients[socket.id] = socket;
    let room = joinRoom(socket);
    let index = global.players.push(socket.readableName) - 1;
    stat('join');
    socket.on('disconnect', function() {
      global.players.splice(index, 1);
      socket.to(room).emit('disco', socket.id);
      games[room].removePlayer(socket.id);
      cleanRoom(room);
      destroy(socket.id);
      stat('disco');
    });
  });
};

io.on('connection', (socket) => {
  connect(socket);
});

module.exports = io;
