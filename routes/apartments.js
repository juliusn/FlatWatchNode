const express = require('express');
const router = new express.Router();

router.get('/', function(req, res, next) {
  res.send('apartments');
});

module.exports = router;
