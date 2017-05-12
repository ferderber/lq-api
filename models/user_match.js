const Model = require('objection').Model;
const User = require('./user');

class UserMatch extends Model {
  static get tableName() {
    return 'UserMatch';
  }
  static get jsonSchema() {
    return {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        userId: { type: 'integer' },
      },
    };
  }
  $parseDatabaseJson(json) {
    json.id = parseInt(json.id);
    return super.$parseDatabaseJson(json);
  }
}

module.exports = UserMatch;
