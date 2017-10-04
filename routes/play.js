var express = require('express');
var router = express.Router();

let capitalize = (string) => {
  return string.split(' ').reduce((a,b) => {
    return a + ' ' + b[0].toUpperCase() + b.substr(1);
  }, '');
};

router.get('/', function(req, res, next) {
  console.log(global.players);
  if (req.session && req.session.user) {
    delete req.session.user;
  }
  res.render('connect', { title: '*friendship' });
});
router.post('/', function(req, res, next) {
  console.log(global.players);
  if (req.body
      && req.body.uname
      && global.players.indexOf(req.body.uname) === -1) {
    let user = {
      name: capitalize(req.body.uname),
      connected_at: Date.now()
    };
    res.render('play', { title: '*friendship', user: user });
  } else {
    let message = 'Sorry, you must choose a name to play (it does not have to be your REAL name, though)…';
    if (global.players.indexOf(req.body.uname) !== -1) {
      message = 'Sorry, someone with this username already exists…';
    }
    res.render('connect', { title: '*friendship', message: message });
  }
});

module.exports = router;
