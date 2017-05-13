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
        role1: { type: 'string', enum: ['fighter', 'marksman', 'support', 'assassin', 'mage', 'tank'] },
        role2: { type: 'string', enum: ['fighter', 'marksman', 'support', 'assassin', 'mage', 'tank'], default: null },
      },
    };
  }
}

module.exports = Champion;
