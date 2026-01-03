const libraryRoutes = require('./library');
const articleRoutes = require('./articles');
const contactRoutes = require('./contact');
const { router: authRoutes } = require('./auth');

module.exports = {
  libraryRoutes,
  articleRoutes,
  contactRoutes,
  authRoutes
};
