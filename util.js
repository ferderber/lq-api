const config = require('./config.js');
const LeagueJS = require('leaguejs');

module.exports.api = new LeagueJS(config.leagueAPIKey, { caching: { isEnabled: true }, PLATFORM_ID: 'na1' });
