import App from "./app.js";

const content = document.querySelector('#content');

document.addEventListener('DOMContentLoaded', async () => {
  const content = document.querySelector('#content');
  const app = new App({ content });
  await app.renderPage();
  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });
});