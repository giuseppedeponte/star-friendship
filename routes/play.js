var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  if (req.session && req.session.user) {
    res.render('play', { title: '*friendship', user : req.session.user });
  } else {
    res.render('connect', { title: '*friendship'});
  }
});
router.post('/', function(req, res, next) {
  if (req.body && req.body.uname) {
    req.session.user = {
      name: req.body.uname,
      connected_at: Date.now()
    };
    res.render('play', { title: '*friendship', user : req.session.user });
  }
});

module.exports = router;
