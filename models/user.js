const Model = require('objection').Model;
const UserQuest = require('./user_quest');
const UserMatch = require('./user_match');
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
        summonerId: { type: 'integer' },
        accountId: { type: 'integer' },
        verificationId: { type: 'uuid' },
        verified: { type: 'boolean', default: false },
        fighter: { type: 'boolean', default: true },
        assassin: { type: 'boolean', default: true },
        tank: { type: 'boolean', default: true },
        support: { type: 'boolean', default: true },
        mage: { type: 'boolean', default: true },
        marksman: { type: 'boolean', default: true },
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
          from: 'User.summonerId',
          to: 'Summoner.id',
        },
      },
      matches: {
        relation: Model.HasManyRelation,
        modelClass: UserMatch,
        join: {
          from: 'User.id',
          to: 'UserMatch.userId',
        },
      },
    };
  }
  async $beforeInsert() {
    this.password = await bcrypt.hash(this.password, 8);
  }
}

module.exports = User;
