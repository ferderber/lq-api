const Model = require('objection').Model;
const QuestObjective = require('./quest_objective');
const Champion = require('./champion');

class Quest extends Model {
  static get tableName() {
    return 'Quest';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['title', 'championId', 'points'],

      properties: {
        id: { type: 'integer' },
        title: { type: 'string' },
        championId: { type: 'integer' },
        type: { type: 'integer' },
        points: { type: 'integer' },
      },
    };
  }

  static get relationMappings() {
    return {
      objectives: {
        relation: Model.HasManyRelation,
        modelClass: QuestObjective,
        join: {
          from: 'Quest.id',
          to: 'QuestObjective.questId',
        },
      },
      champion: {
        relation: Model.HasOneRelation,
        modelClass: Champion,
        join: {
          from: 'Quest.championId',
          to: 'Champion.id',
        },
      },
    };
  }
}

module.exports = Quest;
