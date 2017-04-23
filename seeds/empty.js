
exports.seed = function (knex, Promise) {
  // Deletes ALL existing entries
  return Promise.all([
    knex('Champion').del(),
    knex('Quest').del(),
    knex('Objective').del(),
    knex('QuestObjective').del(),
    knex('UserQuestObjective').del(),
    knex('UserQuest').del(),
    knex('User').del()]);
};
