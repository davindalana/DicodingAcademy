import RegisterPage from '../auth/register/register-page';
import LoginPage from '../auth/login/login-page';
import HomePage from '../view/home-page';
import AddStoryPage from '../view/add-story-page';
import AddGuestPage from '../view/add-guest-page';
import StoryDetailPage from '../view/story-detail-page';
import SavedStoriesPage from '../view/saved-stories';
import { checkAuthenticatedRoute, checkUnauthenticatedRouteOnly } from '../utils/auth';

export const routes = {
  '#/login': () => checkUnauthenticatedRouteOnly(new LoginPage()),
  '#/register': () => checkUnauthenticatedRouteOnly(new RegisterPage()),
  '#/': () => checkAuthenticatedRoute(new HomePage()),
  '#/add': () => checkAuthenticatedRoute(new AddStoryPage()),
  '#/stories/:id': () => checkAuthenticatedRoute(new StoryDetailPage()), 
  '#/saved': () => checkAuthenticatedRoute(new SavedStoriesPage()),
  '#/guest': () => checkUnauthenticatedRouteOnly(new AddGuestPage()), 
};
