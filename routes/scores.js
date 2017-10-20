var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
const Ship = require('../models/Ship');
const Friend = require('../models/Friend');
router.get('/', function(req, res, next) {
  Ship.find().sort({ score: 1 }).limit(10).exec(function(err, ships) {
    if (err) {
      console.log(err);
      ships = [];
    }
    Friend.find().sort( { score: 1 }).limit(10).exec(function(err, friends) {
      if (err) {
        console.log(err);
        friends = [];
      }
      res.render('scores', {
        title: '*friendship',
        ships: ships,
        friends: friends
      });
    });
  });
});
module.exports = router;
