var GAME = {};
$(function() {

  var sock = io('http://192.168.107.156:3000');
  GAME.ownName = $('#players figure:first-of-type figcaption').first().text();

  sock.emit('handshake++', {
    name: GAME.ownName
  });

  sock.on('handshake++', function(data) {
    GAME.ownId = data.id;
  });

  sock.on('checkin', function(data) {
    GAME.roomNo = data.roomNo;
  });

  sock.on('game-on', function(data) {
    GAME.opponentId = data.p2;
    GAME.opponentName = data.p2r;
    let src = GAME.opponentName.toLowerCase().split(' ').join('-');
    $('#players figure:last-of-type figcaption').first().html(GAME.opponentName);
    $('#players figure:last-of-type img').attr('src', 'https://api.adorable.io/avatars/50/' + src);
  });

});
