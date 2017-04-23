const config = require('./config');

module.exports = {
  client: config.dialect,
  connection: { user: config.user, database: config.database },
};
