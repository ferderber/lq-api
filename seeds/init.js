const k = require('../util').kindred();
const Champion = require('../models/champion');
const Quest = require('../models/quest');
const Model = require('objection').Model;

function getObjectives() {
  const objectives = [
    { id: 1, key: 'kills', title: 'Kills' },
    { id: 2, key: 'assists', title: 'Assists' },
    { id: 3, key: 'deaths', title: 'Deaths' },
    { id: 4, key: 'wardsPlaced', title: 'Wards Placed' },
    { id: 5, key: 'wardsDestroyed', title: 'Wards Destroyed' },
    { id: 6, key: 'damage', title: 'Damage' },
    { id: 7, key: 'cs', title: 'Minion Kills' },
    { id: 8, key: 'games', title: 'Games Played' },
  ];
  return objectives;
}
function getChampions() {
  return k.Static.champions({ options: { champData: 'all', champListData: 'tags' } }).then((champions) => {
    const champKeys = Object.keys(champions.data);
    const champs = [];
    for (let i = 0; i < champKeys.length; i += 1) {
      const champion = champions.data[champKeys[i]];
      console.log(champion.tags);

      // Remove invalid data from shen
      const role1 = champion.tags[0].substring(0, champion.tags[0].indexOf(',') === -1 ? champion.tags[0].length : champion.tags[0].indexOf(',')).toLowerCase();
      champs.push({
        id: champion.id,
        name: champion.name,
        key: champion.key,
        role1,
        role2: champion.tags[1] ? champion.tags[1].toLowerCase() : null,
      });
    }
    return champs;
  });
}
async function addQuests() {
  return Champion.query().then((champions) => {
    const quests = [];
    for (let i = 0; i < champions.length; i++) {
      quests.push({
        title: `${champions[i].name} Mastery`,
        championId: champions[i].id,
        type: 0,
        points: 20,
        objectives: [{ objectiveId: 1, goalType: 0, goal: 100 }],
      });
    }
    return Quest.query().insertGraph(quests);
  });
}
exports.seed = (knex) => {
  Model.knex(knex);
  return knex('Objective').insert(getObjectives())
    .then(() => getChampions())
    .then(champions => knex('Champion').insert(champions))
    .then(() => addQuests());
};
