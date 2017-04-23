const Model = require('objection').Model;

class Champion extends Model {
  static get tableName() {
    return 'Champion';
  }
  static get jsonSchema() {
    return {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        key: { type: 'string' },
        name: { type: 'string' },
      },
    };
  }
}

module.exports = Champion;
