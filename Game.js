const mongoose = require('mongoose');
const Ship = require('./models/Ship');
const Friend = require('./models/Friend');
module.exports.create = (function() {
  let Game = function(id, io, config) {
    this.id = id;
    this.io = io;
    this.players = {};
    this.count = 0;
    this.config = config;
    this.currentRound = 0;
    this.currentSentence = null;
  };
  // NOTIFICATION MECHANISM
  // Attach message listener only to room sockets
  Game.prototype.on = function(subject, callback) {
    const that = this;
    Object.keys(that.players).map(function(key) {
      that.players[key].on(subject, callback);
    });
  };
  Game.prototype.off = function(subject) {
    const that = this;
    Object.keys(that.players).map(function(key) {
      that.players[key].removeAllListeners(subject);
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
      console.log(this.currentState);
      if (this.states[this.currentState]
          && this.states[this.currentState].start) {
        this.states[this.currentState].start(from, that.currentState, that);
      }
    }
    return this;
  };
  Game.prototype.removePlayer = function(playerId) {
    delete this[playerId];
    this.notifyRoom('disco', playerId);
    this.count -=1;
  };
  Game.prototype.addPlayer = function(socket) {
    // Add new player to game.players hash
    this.players[socket.id] = socket;
    this.players[socket.id].score = 0;
    // Send the room number to new player
    this.notifyPlayer(socket.id, 'joinRoom', this.id);
    // Update players count
    this.count += 1;
    // Check if room is full
    if (this.count === 2) {
      let players = Object.keys(this.players).reduce((obj, id) => {
        obj[id] = {
          id: id,
          name: this.players[id].readableName,
          score: 0
        };
        return obj;
      }, {});
      this.notifyRoom('roomFull', {
        players: players
      });
      this.transitionTo('init');
    }
  };
  Game.prototype.states = {
    init: {
      start: function(from, to, game) {
        this.playersQueue = 2;
        // Set up current round and reset previous round if needed
        game.currentSentence = game.config.sentences[game.currentRound];
        // Send currentSentence to players
        game.notifyRoom('newRound', game.currentSentence);
        // strip all non letters chars from sentence
        game.currentSentence = game.currentSentence
                                   .toLowerCase()
                                   .split('')
                                   .filter((char) => {
                                      return /[\w]|[\s]/.test(char);
                                    })
                                    .join('');
        if (game.currentSentence[0] === ' ') {
          game.currentSentence = game.currentSentence.substr(1);
        }
        // Listen for ready message from both
        game.on('playerReady', (data) => {
          console.log(data);
          this.updateQueue(game, this);
        });
      },
      updateQueue: (game, state) => {
        state.playersQueue -= 1;
        if (state.playersQueue === 0) {
          game.transitionTo('play');
        }
      },
      stop: function(from, to, game) {
        game.off('playerReady');
      }
    },
    play: {
      start: function(from, to, game) {
        this.playersQueue = 2;
        this.sentence = game.currentSentence;
        this.status = {};
        Object.keys(game.players).map((key) => {
          this.status[key] = {
            p: key,
            i: 0,
            s: ''
          }
        });
        // Set start
        this.timer = Date.now();
        // Start listening for incoming letters
        game.on('letter', (data) => {
          this.update(data, game, this);
        });
      },
      update: (data, game, state) => {
        // check character
        data.c = data.c[0].toLowerCase();
        if (data.c === game.currentSentence[state.status[data.p].i]) {
          // update player status
          state.status[data.p].i += 1;
          state.status[data.p].s += data.c;
          // notify the room
          game.notifyRoom('letter', state.status[data.p]);
          // check if player has finished
          if (state.status[data.p].i === game.currentSentence.length) {
            // update score
            game.players[data.p].score += Date.now() - state.timer - 10000;
            game.notifyRoom('score', {
              p: data.p,
              score: game.players[data.p].score
            });
            state.playersQueue -= 1;
            // check if both players have finished
            if (state.playersQueue === 0) {
              game.transitionTo('end');
            }
          }
        }
      },
      stop: function(from, to, game) {
        // Stop listening for letters
        game.off('letter');
        // update round number
        game.currentRound += 1;
      }
    },
    end: {
      start: function(from, to, game) {
        // Notify room
        game.notifyRoom('roundEnd', {});
        // Start next round if there is one
        if (game.config.sentences[game.currentRound]) {
          setTimeout(() => {
            game.transitionTo('init');
          }, 3000);
        } else {
          let score = {};
          let bestScore;
          score.peas = Object.keys(game.players).reduce((a, b) => {
            a = game.players[a];
            b = game.players[b];
            return a.readableName + '#' + b.readableName;
          });
          score.totalScore = Object.keys(game.players).reduce((n, p) => {
            p = game.players[p];
            score[p.id] = p.score;
            if (!bestScore || p.score < bestScore) {
              bestScore = p.score;
              score.winner = p.id;
            } else if ( p.score === bestScore) {
              score.winner = 'draw';
            }
            return n + p.score;
          }, 0);
          game.notifyRoom('gameOver', score);
          // Save score to database
          let date = new Date();
          let ship = new Ship({
            name: score.peas,
            score: score.totalScore,
            players: Object.keys(game.players).reduce((array, key) => {
              array.push({
                name: game.players[key].readableName,
                score: game.players[key].score
              });
              return array;
            }, []),
            date: date
          }).save(function(err, ship) {
            console.log('Game saved.')
            let playerCount = 2;
            Object.keys(game.players).map((key) => {
              let friend = new Friend({
                name: game.players[key].readableName,
                score: game.players[key].score,
                game: score.peas,
                date: date
              }).save(function(err, friend) {
                if (err) {
                  console.log(err);
                } else {
                  playerCount -= 1;
                  console.log(friend);
                  if (playerCount === 0) {
                    console.log('All players saved.');
                  }
                }
              });
            });
          });
        }
      },
      stop: function(from, to, game) {}
    },
    disconnect: {
      start: function(from, to, game) {
        // notify room
      },
      stop: function(from, to, game) {}
    }
  };
  return function(id, io, config) {
    return new Game(id, io, config);
  };
}());
