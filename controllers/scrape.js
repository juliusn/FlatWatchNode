const rp = require('request-promise');
const cheerio = require('cheerio');
const options = {
  uri: 'https://www.hel.fi/kv/stadinasunnot-fi/hekan-asunnot/hae-asuntoa-heka/vapaat-asunnot/',
  transform: (body) => {
    return cheerio.load(body);
  },
};
const scrape = () => {
  rp(options).then(($) => {
    const apartments = [];
    const elements = $('div[id^="apartment-"]');
    elements.map((i, e) => {
      const apartment = {};
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
      apartments.push(apartment);
    });
  }).catch((err) => {
    console.log(err.message);
  });
};

module.exports = scrape;
