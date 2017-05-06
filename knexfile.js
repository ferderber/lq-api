const config = require('./config.js');

module.exports = {
  client: config.dialect,
  connection: { user: config.user, password: config.password, database: config.database },
};
