const Model = require('objection').Model;
const Quest = require('./quest');
const UserQuestObjective = require('./user_quest_objective');

class UserQuest extends Model {
  static get tableName() {
    return 'UserQuest';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        questId: { type: 'integer' },
        userId: { type: 'integer' },
        active: { type: 'boolean', default: false },
        completed: { type: 'boolean', default: false },
        activationDate: { type: 'string' },
      },
    };
  }

  static get relationMappings() {
    return {
      quest: {
        relation: Model.HasOneRelation,
        modelClass: Quest,
        join: {
          from: 'UserQuest.questId',
          to: 'Quest.id',
        },
      },
      objectives: {
        relation: Model.HasManyRelation,
        modelClass: UserQuestObjective,
        join: {
          from: 'UserQuest.id',
          to: 'UserQuestObjective.userQuestId',
        },
      },
    };
  }
}

module.exports = UserQuest;
