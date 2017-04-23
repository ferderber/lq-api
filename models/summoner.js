const Model = require('objection').Model;

class User extends Model {
  static get tableName() {
    return 'Summoner';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['id', 'summonerName', 'profileIconId', 'level'],
      properties: {
        id: { type: 'integer' },
        summonerName: { type: 'string' },
        profileIconId: { type: 'integer' },
        level: { type: 'integer' },
      },
    };
  }

}

module.exports = User;
