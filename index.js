const Koa = require('koa');
const config = require('./config');
const koajwt = require('koa-jwt');
const bodyParser = require('koa-bodyparser');
const cors = require('kcors');
const jwt = require('jsonwebtoken');
const routes = require('./routes');
const knexConf = require('./knexfile');
const Model = require('objection').Model;
const Knex = require('knex');

// Initialize knex connection.
const knex = Knex(knexConf);

// Give the connection to objection.
Model.knex(knex);

const app = new Koa();
app.use(bodyParser());
// In development use cross origin (allows web application access)
if (process.env.NODE_ENV !== 'production') { app.use(cors()); }

// Load unprotected routes from array
routes.public.forEach(route => app.use(route));

app.use(koajwt({
  secret: config.secret,
}));
// Decodes and adds the user id from the JWT
app.use(async (ctx, next) => {
  ctx.authHeader = ctx.request.header.authorization.substring(7); // remove Bearer
  ctx.user = { id: jwt.decode(ctx.authHeader, config.secret).id };
  await next();
});
// Load authentication-required routes
routes.auth.forEach(route => app.use(route));
app.listen(config.port, () => console.log(`Listening on port ${config.port}`));
