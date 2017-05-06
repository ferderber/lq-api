const Model = require('objection').Model;

class Objective extends Model {
  static get tableName() {
    return 'Objective';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['key'],
      properties: {
        id: { type: 'integer' },
        key: { type: 'string', minLength: 1, maxLength: 255 },
        title: { type: 'string', minLength: 1, maxLength: 255 },
      },
    };
  }
}

module.exports = Objective;
