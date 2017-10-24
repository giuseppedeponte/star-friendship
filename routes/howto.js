var express = require('express');
var router = express.Router();
router.get('/', function(req, res, next) {
  res.render('howto', {
    title: '*friendship'
  });
});
module.exports = router;
