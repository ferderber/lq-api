const Model = require('objection').Model;
const UserQuest = require('./user_quest');
const Summoner = require('./summoner');
const bcrypt = require('bcrypt');

class User extends Model {
  static get tableName() {
    return 'User';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['username', 'password', 'email'],
      properties: {
        id: { type: 'integer' },
        username: { type: 'string', minLength: 1, maxLength: 100 },
        password: { type: 'string' },
        email: { type: 'string' },
        leagueId: { type: 'integer' },
      },
    };
  }

  static get relationMappings() {
    return {
      quests: {
        relation: Model.HasManyRelation,
        modelClass: UserQuest,
        join: {
          from: 'User.id',
          to: 'UserQuest.userId',
        },
      },
      summoner: {
        relation: Model.HasOneRelation,
        modelClass: Summoner,
        join: {
          from: 'User.leagueId',
          to: 'Summoner.id',
        },
      },
    };
  }
  async $beforeInsert() {
    this.password = await bcrypt.hash(this.password, 8);
  }
}

module.exports = User;
