const Model = require('objection').Model;
const Objective = require('./objective');

class QuestObjective extends Model {
  static get tableName() {
    return 'QuestObjective';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        questId: { type: ['integer', 'null'] },
        objectiveId: { type: ['integer', 'null'] },
        goalType: { type: 'integer' },
        goal: { type: 'integer' },
      },
    };
  }

  static get relationMappings() {
    return {
      objective: {
        relation: Model.HasOneRelation,
        modelClass: Objective,
        join: {
          from: 'QuestObjective.objectiveId',
          to: 'Objective.id',
        },
      },
    };
  }
}

module.exports = QuestObjective;
