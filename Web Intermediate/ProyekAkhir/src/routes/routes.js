import RegisterPage from '../pages/auth/register/register-page';
import LoginPage from '../pages/auth/login/login-page';
import HomePage from '../view/home-page';
import AddStoryPage from '../pages/add/add-story-page';
import StoryDetailPage from '../pages/story-detail/story-detail-page';
import SavedStoriesPage from '../views/pages/saved-stories';
import { checkAuthenticatedRoute, checkUnauthenticatedRouteOnly } from '../utils/auth';

export const routes = {
  '#/login': () => checkUnauthenticatedRouteOnly(new LoginPage()),
  '#/register': () => checkUnauthenticatedRouteOnly(new RegisterPage()),
  '#/': () => checkAuthenticatedRoute(new HomePage()),
  '#/add': () => checkAuthenticatedRoute(new AddStoryPage()),
  '#/story/:id': () => checkAuthenticatedRoute(new StoryDetailPage()),
  '#/saved': checkAuthenticatedRoute(new SavedStoriesPage()),
};
