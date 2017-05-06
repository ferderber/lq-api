
exports.seed = (knex, Promise) =>
  // Deletes ALL existing entries
  Promise.all([
    knex('QuestObjective').del(),
    knex('UserQuestObjective').del(),
    knex('Quest').del(),
    knex('UserQuest').del(),
    knex('Objective').del(),
    knex('Champion').del(),
    knex('User').del(),
    knex('Summoner').del()]);
