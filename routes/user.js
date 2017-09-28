const User = require('../models/user.js');
const jwt = require('jsonwebtoken');
const config = require('../config');
const bcrypt = require('bcrypt');
const api = require('../util').api;
const Summoner = require('../models/summoner');
const uuid = require('uuid');

const secret = config.secret;

// Validates that a password matches its hash
async function isValidPassword(passwordHash, password) {
  return bcrypt.compare(password, passwordHash);
}
// Creates a flattened user object
function createUserResponse(user) {
  return {
    username: user.username,
    email: user.email,
    summonerName: user.summoner.summonerName,
    profileIconId: user.summoner.profileIconId,
    level: user.summoner.level,
    verified: user.verified,
    verificationId: user.verificationId,
    roles: {
      assassin: user.assassin,
      mage: user.mage,
      support: user.support,
      fighter: user.fighter,
      marksman: user.marksman,
      tank: user.tank,
    },
  };
}

// Creates stats for an array of users
function createStatsResponse(users) {
  return users.map(user => ({
    summonerName: user.summoner.summonerName,
    level: user.summoner.level,
    points: user.quests
      .reduce((acc, quest) => acc + (quest.completed ? quest.quest.points : 0), 0),
  }));
}

// Routes
module.exports = {
  getUser: async (ctx) => {
    ctx.body = await User.query().eager('summoner')
      .findById(ctx.user.id)
      .then(user => createUserResponse(user));
  },
  patchUser: async (ctx) => {
    const body = ctx.request.body;
    ctx.body = await User
      .query()
      .patchAndFetchById(ctx.user.id, body.roles)
      .eager('summoner')
      .then(user => createUserResponse(user));
  },
  createUser: async (ctx) => {
    const user = ctx.request.body;
    if (user && user.username && user.email && user.password && user.summonerName) {
      const summoner = await api.Summoner.gettingByName(user.summonerName)
        .catch(err => console.error(err));
      try {
        const s = await Summoner.query().insertAndFetch({
          id: summoner.id,
          summonerName: summoner.name,
          profileIconId: summoner.profileIconId,
          level: summoner.summonerLevel,
        });
        const u = await User.query().insertAndFetch({
          username: user.username,
          password: user.password,
          email: user.email,
          summonerId: summoner.id,
          accountId: summoner.accountId,
          verificationId: uuid.v4(),
        });
        const token = jwt.sign({ id: u.id }, secret);
        u.summoner = s;
        ctx.body = {
          user: createUserResponse(u),
          token,
        };
      } catch (err) {
        ctx.status = 403;
        if (err.code === '23505') {
          ctx.body = { message: 'A user is already registered with that Summoner name / Username' };
        } else {
          ctx.body = { message: 'An error occured creating your account' };
        }
      }
    } else {
      ctx.body = { message: 'Missing user details' };
      ctx.status = 400;
    }
  },
  authenticate: async (ctx) => {
    try {
      const users = await User.query()
        .eager('summoner')
        .where(User.raw('lower("username")'), 'like', `${ctx.request.body.username}`);
      const user = users[0];
      if (user && await isValidPassword(user.password, ctx.request.body.password)) {
        const payload = { id: user.id };
        const token = jwt.sign(payload, secret);
        ctx.body = { message: 'ok', token, user: createUserResponse(user) };
      } else {
        ctx.body = { message: 'Invalid username or password' };
        ctx.status = 401;
      }
    } catch (err) {
      ctx.status = 500;
    }
  },
  getStats: async (ctx, limit) => {
    ctx.body = createStatsResponse(await User.query()
      .eager('[quests.quest, summoner]'))
      .sort((u1, u2) => u1.points < u2.points).slice(0, limit);
  },
  verify: async (ctx) => {
    try {
      const user = await User.query().findById(ctx.user.id);
      if (user) {
        if (!user.verified) {
          const runes = await api.Runes.gettingBySummoner(user.summonerId);
          if (runes && !runes.pages.some(rune => rune.name === user.verificationId)) {
            user.verified = true;
            User.query()
              .patch({ verified: true })
              .where('id', user.id).execute();
            ctx.status = 200;
            ctx.body = createUserResponse(user);
          } else {
            ctx.status = 400;
            ctx.body = { message: 'No valid rune page found' };
          }
        } else {
          ctx.status = 200;
          ctx.body = { message: 'Already verified' };
        }
      } else {
        ctx.status = 401;
      }
    } catch (err) {
      ctx.status = 500;
    }
  },
};
