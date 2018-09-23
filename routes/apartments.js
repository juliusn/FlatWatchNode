const express = require('express');
const router = new express.Router();
const scrape = require('../controllers/scrape');

router.get('/', function(req, res, next) {
  scrape();
});

module.exports = router;
