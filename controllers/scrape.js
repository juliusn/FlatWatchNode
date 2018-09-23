const rp = require('request-promise');
const cheerio = require('cheerio');
const Datastore = require('@google-cloud/datastore');
const datastore = new Datastore();

const options = {
  uri: 'https://www.hel.fi/kv/stadinasunnot-fi/hekan-asunnot/hae-asuntoa-heka/vapaat-asunnot/',
  transform: (body) => {
    return cheerio.load(body);
  },
};

const scrape = () => {
  const scrapedApartments = [];
  rp(options).then(($) => {
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
      scrapedApartments.push(apartment);
    });

    const query = datastore.createQuery('Apartment');

    datastore.runQuery(query).then((results) => {
      const storedEntities = results[0];
      const storedKeys = storedEntities.map((entity) => {
        return entity[datastore.KEY].name;
      });

      const foundDate = new Date();

      const newEntities = [];

      scrapedApartments.map((apartment) => {
        if (!storedKeys.includes(apartment.id)) {
          apartment.found = foundDate;

          const key = datastore.key(['Apartment', apartment.id]);

          const entity = {
            key: key,
            data: apartment,
          };

          newEntities.push(entity);
        }
      });

      if (newEntities.length < 1) return;

      datastore.upsert(newEntities).then(() => {
        console.log('Saved ' + newEntities.length + ' new apartments');
      }).catch((err) => {
        console.error(err);
      });
    }).catch((err) => {
      console.error(err);
    });
  }).catch((err) => {
    console.error(err.message);
  });
};

module.exports = scrape;
