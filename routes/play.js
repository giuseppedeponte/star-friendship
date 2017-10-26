var express = require('express');
var router = express.Router();
router.get('/', function(req, res, next) {
  if (req.session && req.session.user) {
    let username = req.session.user;
    delete req.session.user;
    res.render('play', { title: '*friendship', user: username });
  } else {
    res.render('connect', { title: '*friendship' });
  }
});
router.post('/', function(req, res, next) {
  if (req.body
      && req.body.uname
      && req.body.uname.length <= 40
      && global.players.indexOf(req.body.uname) === -1) {
    req.session.user = req.body.uname;
    res.redirect('/play');
  } else {
    let message = 'Sorry, you must choose a name to play (it does not have to be your REAL name, though)…';
    if (req.body.uname.length > 40) {
      message = 'Sorry, you must choose a name shorter than 40 characters…';
    }
    if (global.players.indexOf(req.body.uname) !== -1) {
      message = 'Sorry, someone with this username already exists…';
    }
    res.render('connect', { title: '*friendship', message: message });
  }
});
module.exports = router;
