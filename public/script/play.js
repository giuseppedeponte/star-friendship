$(function() {
  $('#nav').addClass('fixed');
  $('header').hide();

  var GAME;
  var ME;
  var NME;
  var defNME = {
    name: '...',
    score: 0
  };
  var sock = io(window.location.origin);
  var dialog = function(message, fa) {
    fa = fa || 'fa-cog fa-spin';
    $('#dialog .fa').attr('class', 'fa fa-fw ' + fa);
    $('#dialog .text').text(message);
    $('#dialog').show();
  };
  var render = function(player, property) {
    if (property) {
      $('.' + player + ' .' + property).text(GAME.players[player][property]);
    } else {
      for (property in GAME.players[player]) {
        $('.' + player + ' .' + property).text(GAME.players[player][property]);
      }
      $('.' + player + ' .avatar').attr('src', 'https://api.adorable.io/avatars/50/' + GAME.players[player].name.toLowerCase().split(' ').join('-'));
    }
  };
  var connect = function() {
    var whoAmI = $('#players .me .name').first().text();
    sock.emit('handshake++', whoAmI);

    sock.on('handshake++', function(data) {
      ME = data;
      $('.me').addClass(data);
    });

    sock.on('joinRoom', function(data) {
      console.log('Joined room:', data);
    });

    sock.on('roomFull', function(data) {
      console.log('roomFull', data);
      GAME = Object.create(data);
      dialog('Get ready to play...', 'fa-gamepad');
      for (id in GAME.players) {
        if (id !== ME) {
          NME = id;
          $('.nme').addClass(id);
        }
      }
      render(ME);
      render(NME);
    });
    sock.on('disco', function(game) {
      dialog('The other player has left the room.\n\rReload the page to play again.', 'fa-exclamation-circle');
      GAME.players[NME] = Object.create(defNME);
      render(NME);
      $('.' + NME + ' .avatar').attr('src', '');
    });
    window.addEventListener('beforeunload', function() {
      sock.close();
    });
  };

  connect();

});
