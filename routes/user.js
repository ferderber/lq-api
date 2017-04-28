const User = require('../models/user.js');
const jwt = require('jsonwebtoken');
const config = require('../config');
const bcrypt = require('bcrypt');
const k = require('../util').kindred();
const Quest = require('../models/quest');
const Summoner = require('../models/summoner');
const UserQuest = require('../models/user_quest');

const secret = config.secret;

// Validates that a password matches its hash
function isValidPassword(passwordHash, password) {
  return bcrypt.compareSync(password, passwordHash);
}
// Creates a flattened user object
function createUserResponse(user) {
  return {
    username: user.username,
    email: user.email,
    summonerName: user.summoner.summonerName,
    profileIconId: user.summoner.profileIconId,
    level: user.summoner.level,
  };
}

// Routes
module.exports = {
  getUser: async (ctx) => {
    ctx.body = await User.query().eager('summoner')
      .findById(ctx.user.id)
      .then(user => createUserResponse(user));
  },
  createUser: async (ctx) => {
    const user = ctx.request.body;
    if (user && user.username && user.email && user.password && user.summonerName) {
      const summoner = await k.Summoner.get({ name: user.summonerName })
        .catch(err => console.error(err));
      const s = await Summoner.query().insertAndFetch({
        id: summoner.id,
        summonerName: summoner.name,
        profileIconId: summoner.profileIconId,
        level: summoner.summonerLevel });
      const u = await User.query().insertAndFetch({
        username: user.username,
        password: user.password,
        email: user.email,
        summonerId: summoner.id,
        accountId: summoner.accountId,
      });
      const token = jwt.sign({ id: u.id }, secret);
      u.summoner = s;
      ctx.body = {
        user: createUserResponse(u),
        token,
      };
      Quest.query().eager('[objectives]')
        .where('championId', '=', 134)
        .orWhere('championId', '=', 99)
        .orWhere('championId', '=', 67)
        .orWhere('championId', '=', 103)
        .orWhere('championId', '=', 1)
        .orWhere('championId', '=', 22)
        .orWhere('championId', '=', 51)
        .then((quests) => {
          console.log(quests);
          const userQuests = [];
          for (let i = 0; i < quests.length; i++) {
            const questObjectives = [];
            for (let j = 0; j < quests[i].objectives.length; j++) {
              const obj = quests[i].objectives[j];
              questObjectives.push({ questObjectiveId: obj.id, progress: 0 });
            }
            userQuests.push({
              questId: quests[i].id,
              userId: u.id,
              complete: false,
              active: true,
              activationDate: new Date().toUTCString(),
              objectives: questObjectives,
            });
          }
          return userQuests;
        })
        .then(userQuests => UserQuest.query().insertGraph(userQuests))
        .catch(err => console.error(err));
    } else {
      ctx.status = 412;
      ctx.body = { message: 'Missing signup details' };
    }
  },
  authenticate: async (ctx) => {
    await User.query()
      .eager('summoner')
      .where('username', ctx.request.body.username)
      .then((u) => {
        const user = u[0];
        if (isValidPassword(user.password, ctx.request.body.password)) {
          const payload = { id: user.id };
          const token = jwt.sign(payload, secret);
          ctx.body = { message: 'ok', token, user: createUserResponse(user) };
        } else {
          ctx.body = { message: 'Invalid username or password' };
          ctx.status = 401;
        }
      })
      .catch(err => console.error(err));
  },
  getStats: async (ctx) => {
    ctx.status = 405;
  },
  verify: (ctx) => {
    ctx.status = 405;
  },
};
