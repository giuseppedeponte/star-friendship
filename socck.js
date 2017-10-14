'use strict';
let createGame = (function() {
  let Game = function(id, io, config) {
    this.id = id;
    this.io = io;
    this.players = {};
    this.count = 0;
    this.config = config;
    this.currentRound = null;
  };
  // NOTIFICATION MECHANISM
  // Attach message listener only to room sockets
  Game.prototype.on = function(subject, callback) {
    let that = this;
    Object.keys(that.players).map(function(key) {
      that.players[key].on(subject, callback);
    });
  };
  // Send message only to one player
  Game.prototype.notifyPlayer = function(playerId, subject, message) {
    if (this.players[playerId]) {
      this.players[playerId].emit(subject, message);
    }
  };
  // Send message to whole room
  Game.prototype.notifyRoom = function(subject, message) {
    this.io.to(this.id).emit(subject, message);
  };
  // STATE MACHINE
  Game.prototype.currentState = '';
  Game.prototype.transitionTo = function(nextState) {
    let that = this;
    let from;
    if (nextState !== this.currentState) {
      if (this.states[this.currentState]
          && this.states[this.currentState].stop) {
        this.states[this.currentState]
            .stop(that.currentState, that.nextState, that);
      }
      from = this.currentState;
      this.currentState = nextState;
      if (this.states[this.currentState]
          && this.states[this.currentState.start]) {
        this.states[this.currentState]
            .start(from, that.currentState, that);
      }
    }
    return this;
  };
  Game.prototype.states = {
    connect: {
      start: function(from, to, game) {
        // listen for connections
      },
      addPlayer: function(socket, game) {
        // Add new player to game.players hash
        game.players[socket.id] = {
          id: socket.id,
          name: socket.readableName,
          score: 0
        };
        // Update players count
        game.count += 1;
        // Check if room is full
        if (game.count === 2) {
          game.transitionTo('init');
        }
      },
      stop: function(from, to, game) {
        // stop listening for connections
      }
    },
    init: {
      start: function(from, to, game) {
        // Set up current round and reset previous round if needed
      },
      stop: function(from, to, game) {}
    },
    play: {
      start: function(from, to, game) {
        // Start listening for incoming letters
      },
      check: function(player, char) {
        // check if char is correct
      },
      update: function(player) {
        // update player status
      },
      render: function() {
        // notify the room
      },
      stop: function(from, to, game) {
        // Stop listening for letters
      }
    },
    end: {
      start: function(from, to, game) {
        // Notify room
        // Start next round if there is one
        // Save score if game is over
      },
      stop: function(from, to, game) {}
    },
    disconnect: {
      start: function(from, to, game) {
        // notify room
      },
      removePlayer = function(playerId, game) {
        delete game[playerId];
        game.count -=1;
      },
      stop: function(from, to, game) {}
    }
  };
  return function(id, io, config) {
    return new Game(id, io, config).transitionTo('connect');
  };
});
