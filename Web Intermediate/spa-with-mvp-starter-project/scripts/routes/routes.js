import HomePage from '../pages/home/home-pages.js';
import CatDetailPage from '../pages/cat-detail/cat-detail-pages.js';
import AboutPage from '../pages/about/about-pages.js';

const routes = {
  '/': () => new HomePage(),
  '/about': () => new AboutPage(),
  '/cat/:id': () => new CatDetailPage(),
};

export default routes;
