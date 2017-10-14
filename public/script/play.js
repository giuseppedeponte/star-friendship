$(function() {
  $('#nav').addClass('fixed');
  $('header, h3').hide();
  var GAME;
  var ME;
  var NME;
  var defNME = {
    name: '...',
    score: 0
  };
  var sock = io(window.location.origin);
  var sendLetter = function(e) {
    sock.emit('letter', {
      c: e.key,
      p: ME
    });
  };
  var dialog = function(message, fa) {
    fa = fa || 'fa-cog fa-spin';
    $('#dialog .fa').attr('class', 'fa fa-fw ' + fa);
    $('#dialog .text').text(message);
    $('#dialog').show();
  };
  var reset = function() {
    $('#sentence .fa').attr('class', 'fa fa-cog fa-spin fa-2x fa-fw');
    $('#sentence').html('—');
    $('.me .sentence').text('');
    $('.nme .sentence').text('');
  };
  var play = function(data) {
    dialog('Get ready to play in 10 s', 'fa-gamepad');
    $('#sentence .fa').attr('class', 'fa fa-hourglass fa-spin fa-2x fa-fw');
    for (var i = 10; i > 0; i -= 1) {
      (function(t) {
        setTimeout(function() {
          var mess = 'Get ready to play in ' + t + ' s';
          dialog(mess, 'fa-gamepad');
        }, (10 - t) * 1000);
      })(i);
    }
    setTimeout(function() {
      var mess = 'Start typing as soon as the sentence appears!';
      dialog(mess, 'fa-gamepad');
      $('#sentence').html(data);
      $(window).on('keyup', sendLetter);
    }, 11000);
    sock.on('letter', function(data) {
      $('.' + data.p + ' .sentence').text(data.s);
    });
    sock.on('score', function(data) {
      GAME.players[data.p].score = data.score / 1000;
      render(data.p, 'score');
    });
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
      for (id in GAME.players) {
        if (id !== ME) {
          NME = id;
          $('.nme').addClass(id);
        }
      }
      render(ME);
      render(NME);
      sock.emit('playerReady', 'ready');
    });
    sock.on('newRound', function(data) {
      reset();
      play(data);
    });
    sock.on('disco', function(game) {
      dialog('The other player has left the room.\n\rReload the page to play again.', 'fa-exclamation-circle');
      GAME.players[NME] = Object.create(defNME);
      render(NME);
      $('.' + NME + ' .avatar').attr('src', '');
    });
    sock.on('doppelganger!', function() {
      console.log('I am two');
      sock.close();
      location.replace(window.location);
    });
    window.addEventListener('beforeunload', function() {
      sock.close();
    });
  };
  connect();
});
