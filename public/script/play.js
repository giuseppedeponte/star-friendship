$(function() {
  $('#nav').addClass('fixed');
  $('header').hide();

  var GAME;
  var sock = io('http://192.168.107.156:3000');
  var render = function(player, property) {
    if (property) {
      $('.' + player + ' .' + property).text(GAME[player][property]);
    } else {
      for (property in GAME[player]) {
        $('.' + player + ' .' + property).text(GAME[player][property]);
      }
    }
  };
  var connect = function() {
    var myId;
    var whoAmI = $('#players .me .name').first().text();
    sock.emit('handshake++', whoAmI);
    sock.on('handshake++', function(data) {
      myId = data;
    });
    sock.on('joinRoom', function(data) {
      console.log('Joined room:', data);
    });
    sock.on('roomFull', function(data) {
      console.log('roomFull', data);
      GAME = Object.create(data);
      GAME.me = GAME.players[0].id === myId ? GAME.players[0] : GAME.players[1];
      GAME.it = GAME.players[0].id === myId ? GAME.players[1] : GAME.players[0];
      $('#players .it .avatar').attr('src', 'https://api.adorable.io/avatars/50/' + GAME.it.name.toLowerCase().split(' ').join('-'));
      render('it');
    });
    sock.on('disconnect', function() {
      GAME = null;
    });
  };

  connect();

});
