const _ = require('koa-route');
const quest = require('./routes/quest');
const user = require('./routes/user');

const routes = {
  auth: [],
  public: [],
};

// Quest endpoint (Requires authentication)
routes.auth.push(_.get('/api/quest', quest.allQuests)); // Returns all quests completed and in progress for an authenticated user
routes.auth.push(_.post('/api/quest/update', quest.updateQuests)); // Returns updated quest progress
routes.auth.push(_.post('/api/quest', quest.offerQuests)); // Returns 3 new quests to choose from
routes.auth.push(_.post('/api/quest/:id/activate', quest.activateQuest)); // Returns newly selected quest

// User endpoint
routes.public.push(_.post('/api/user', user.createUser)); // Creates and returns a new user
routes.public.push(_.post('/api/user/authenticate', user.authenticate)); // Attempts to verify the current authenticated user
routes.auth.push(_.patch('/api/user/verification', user.verify)); // Attempts to verify the current authenticated user
routes.auth.push(_.get('/api/user/:id', user.getUser)); // Gets the user identified by ID
routes.auth.push(_.get('/api/user', user.getUser)); // Gets the current authenticated user

// Leaderboard data (Not yet implemented)
routes.auth.push(_.get('/api/user/stats/:limit', user.getStats)); // Gets the top :limit users sorted by score
// routes.auth.push(_.get('/api/user/:id/stats', user.getStats)); // Gets detailed user stats
// Export array of routes
module.exports = routes;
