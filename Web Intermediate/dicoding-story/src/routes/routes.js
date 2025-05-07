import login from './login.js';
import register from './register.js';
import home from './home.js';
import addStory from './add-story.js';

const routes = {
  '/': login,
  '/register': register,
  '/home': home,
  '/add-story': addStory,
};

export default routes;