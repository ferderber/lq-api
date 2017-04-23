const UserQuest = require('../models/user_quest');
const Quest = require('../models/quest');

// Creates a flattened quest object
function createQuestResponse(quests) {
  console.log(quests);
  return quests.map(q => ({
    title: q.quest.title,
    championId: q.quest.championId,
    championKey: q.quest.champion.key,
    championName: q.quest.champion.name,
    type: q.quest.type,
    active: q.active,
    points: q.quest.points,
    completed: q.completed,
    objectives: q.objectives.map(o => ({
      progress: o.progress,
      goal: o.objective.goal,
      goalType: o.objective.goalType,
      title: o.objective.objective.title,
    })),
  }));
}
// Finds 3 (or fewer) new quests for a user
async function getNewQuests(id) {
  return UserQuest.query().where('userId', '=', id).eager('quest').then((userQuests) => {
    const currentQuests = [];
    for (let i = 0; i < userQuests.length; i++) {
      currentQuests.push(userQuests[i].questId); // Fill with questIds for query
    }
    return currentQuests;
  })
  // Find quests that user is not already doing
  .then(currentQuests => Quest.query().whereNotIn('id', currentQuests).eager('objectives'))
  .then((quests) => {
    const newQuests = [];
    let rand;
    let upperLimit;
    if (quests.length > 3) {
      // Get random position in available quests (3 away from length)
      rand = Math.floor(Math.random() * (quests.length - 3));
      // Only use 3 quests
      upperLimit = rand + 3;
    } else {
      rand = 0;
      upperLimit = quests.length;
    }
    for (let i = rand; i < upperLimit; i++) {
      const questObjectives = [];
      // Create userQuestObjective array for userQuest
      for (let k = 0; k < quests[i].objectives.length; k++) {
        const obj = quests[i].objectives[k];
        questObjectives.push({ questObjectiveId: obj.id, progress: 0 });
      }
      newQuests.push({
        questId: quests[i].id,
        userId: id,
        complete: false,
        active: false,
        objectives: questObjectives,
      });
    }
    return newQuests;
  });
}

// Routes
module.exports = {
  offerQuests: async (ctx) => {
    // Return 3 new quests
    ctx.body = await getNewQuests(ctx.user.id)
    .then(quests => UserQuest.query().insertGraphAndFetch(quests).eager('[objectives.[objective.objective], quest.champion]'))
    .then(quests => createQuestResponse(quests))
    .catch(err => console.error(err));
  },
  activateQuest: async (ctx, id) => {
    // Return newly activated quest
    ctx.body = await UserQuest.query()
    .where('userid', '=', ctx.user.id)
    .eager('[objectives.[objective.objective], quest.champion]')
    .patchAndFetchById(id, { active: true })
    .then(quest => createQuestResponse([quest]))
    .catch(err => console.log(err));
  },
  allQuests: async (ctx) => {
    // Return all quests (in progress or completed) for the given user
    ctx.body = await UserQuest.query()
    .eager('[objectives.[objective.objective], quest.champion]')
    .where('userId', '=', ctx.user.id)
    .then(quests => createQuestResponse(quests));
  },
  updateQuests: async (ctx) => {
    ctx.status = 405;
  },

};
