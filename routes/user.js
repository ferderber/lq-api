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

// Creates stats for an array of users
function createStatsResponse(users) {
  return users.map(user => ({
    summonerName: user.summoner.summonerName,
    level: user.summoner.level,
    points: user.quests
        .reduce((acc, quest) => acc + (quest.completed ? quest.quest.points : 0), 0) }));
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
    } else {
      ctx.body = { message: 'Missing user details' };
      ctx.status = 412;
    }
  },
  authenticate: async (ctx) => {
    await User.query()
      .eager('summoner')
      .where(User.raw('lower("username")'), 'like', `${ctx.request.body.username}`)
      .then((u) => {
        const user = u[0];
        if (user && isValidPassword(user.password, ctx.request.body.password)) {
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
  getStats: async (ctx, limit) => {
    ctx.body = createStatsResponse(await User.query()
      .eager('[quests.quest, summoner]'))
      .sort((u1, u2) => u1.points < u2.points).slice(0, limit);
  },
  verify: (ctx) => {
    ctx.status = 405;
  },
};
