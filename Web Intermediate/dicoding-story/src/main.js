import routes from './routes/routes.js';

document.getElementById('app').innerHTML = '<h1>Hello from Dicoding Story App</h1>';

function renderPage() {
    const hash = window.location.hash.slice(1) || '/';
    const page = routes[hash] || routes['/'];
    page.render(app);
}

window.addEventListener('hashchange', renderPage);
window.addEventListener('load', renderPage);

document.addEventListener('click', (e) => {
    if (e.target.id === 'logoutBtn') {
        localStorage.removeItem('userToken');
        window.location.hash = '/login';
    }
});