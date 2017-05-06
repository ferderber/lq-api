const Kindred = require('kindred-api');
const config = require('./config.js');

const REGIONS = Kindred.REGIONS;
const LIMITS = Kindred.LIMITS;
const CACHETYPES = Kindred.CACHE_TYPES;

module.exports = {
  kindred: () => new Kindred.Kindred({
    key: config.leagueAPIKey,
    defaultRegion: REGIONS.NORTH_AMERICA,
    limits: LIMITS.DEV,
    cacheOptions: CACHETYPES[0],
  }),
};
