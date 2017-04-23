const Model = require('objection').Model;
const QuestObjective = require('./quest_objective');

class UserQuestObjective extends Model {
  static get tableName() {
    return 'UserQuestObjective';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        userQuestId: { type: 'integer' },
        questObjectiveId: { type: 'integer' },
        progress: { type: 'integer' },
      },
    };
  }

  static get relationMappings() {
    return {
      objective: {
        relation: Model.HasOneRelation,
        modelClass: QuestObjective,
        join: {
          from: 'UserQuestObjective.questObjectiveId',
          to: 'QuestObjective.id',
        },
      },
    };
  }

}

module.exports = UserQuestObjective;
