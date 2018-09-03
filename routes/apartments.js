const express = require('express');
const router = new express.Router();
const rp = require('request-promise');
const cheerio = require('cheerio');

const options = {
  uri: 'https://www.hel.fi/kv/stadinasunnot-fi/hekan-asunnot/hae-asuntoa-heka/vapaat-asunnot/',
  transform: function(body) {
    return cheerio.load(body);
  },
};

router.get('/', function(req, res, next) {
  rp(options).then(($) => {
    const elements = $('div[id^="apartment-"]');
    let apartments = parse(elements);
    res.json(apartments);

    function parse(elements) {
      const apartments = [];
      elements.map((i, e) => {
        let apartment = {};
        const idStr = $(e).attr('id');
        apartment.id = idStr.substring('apartment-'.length);
        apartment.rooms = $(e).find('.apartment-type').text();
        apartment.address = $(e).find('#address-' + apartment.id).text();
        apartment.residentialArea = $(e).find('.area').text();
        const floorStr = $(e).find('.floor').text();
        apartment.floor = parseInt(floorStr.replace(/[{()}]/g, ''), 10);
        apartment.type = $(e).
            find('span:contains("Talotyyppi: ")').
            next().
            children().
            text();
        apartments.push(apartment);
        const areaSizeStr = $(e).
            find('span:contains("Pinta-ala: ")').
            next().
            children().
            first().
            text();
        apartment.areaSize = parseFloat(areaSizeStr);
        const rentStr = $(e).
            find('span:contains("Vuokra: ")').
            next().
            children().
            first().
            text();
        apartment.rent = parseFloat(rentStr);
      });
      return apartments;
    }
  }).catch((err) => {
    res.send(err.message);
  });
});
module.exports = router;
