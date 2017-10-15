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
  var playing = false;
  var sendLetter = function(e) {
    sock.emit('letter', {
      c: e.key,
      p: ME
    });
  };
  var dialog = function(message, fa, status) {
    fa = fa || 'fa-cog fa-spin';
    status = status || '';
    $('#dialog').attr('class', status);
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
    if (!playing) { return; }
    var dialogClass = 'fa-cog fa-spin';
    dialog('Get ready to type in 10 s', dialogClass);
    $('#sentence').html('<i class="fa fa-hourglass fa-pulse fa-fw"></i>');
    for (var i = 10; i > 0; i -= 1) {
      (function(t) {
        setTimeout(function() {
          if (!playing) { return; }
            var mess = 'Get ready to type in ' + t + ' s';
            if (t <= 3) {
              dialog(mess, dialogClass, 'yellow');
            } else if (t <= 6) {
              dialog(mess, dialogClass, 'orange');
            } else {
              dialog(mess, dialogClass);
            }
        }, (10 - t) * 1000);
      })(i);
    }
    setTimeout(function() {
      if (!playing) { return; }
      var mess = 'Start typing as fast as possible!';
      dialog(mess, 'fa-terminal', 'green');
      $('#sentence').html(data);
      $(window).on('keyup', sendLetter);
    }, 11000);
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
      playing = true;
    });
    sock.on('newRound', function(data) {
      reset();
      play(data);
    });
    sock.on('letter', function(data) {
      $('.' + data.p + ' .sentence').text(data.s);
    });
    sock.on('score', function(data) {
      GAME.players[data.p].score = data.score / 1000;
      render(data.p, 'score');
      $('.' + data.p + ' .score').parent('figcaption').addClass('animated pulse');
      $('.' + data.p + ' .sentence').parent('p').addClass('animated pulse');
      setTimeout(function() {
        $('.' + data.p + ' .score').parent('figcaption').removeClass('animated pulse');
        $('.' + data.p + ' .sentence').parent('p').removeClass('animated pulse');
      }, 2000);
    });
    sock.on('roundEnd', function(data) {
      $(window).off('keyup', sendLetter);
      setTimeout(function() {
        $('#sentence').addClass('animated pulse');
        setTimeout(function() {
          $('#sentence').removeClass('animated pulse');
          sock.emit('playerReady', 'ready');
        }, 3000);
      }, 500);
    });
    sock.on('disco', function(game) {
      playing = false;
      dialog('The other player has left.\n\rReload the page and reconnect to play.', 'fa-exclamation-circle', 'red');
      GAME.players[NME] = Object.create(defNME);
      render(NME);
      $('.' + NME + ' .avatar').attr('src', '');
      reset();
      sock.off();
      $('#sentence')
      .html('<i class="fa fa-refresh fa-pulse fa-2x fa-fw"></i>')
      .css('cursor', 'pointer')
      .click(function() {
        sock.close();
        location.replace(window.location);
      });
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
