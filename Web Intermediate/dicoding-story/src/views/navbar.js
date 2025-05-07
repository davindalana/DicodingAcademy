export const navBar = () => {
  const nav = document.createElement('nav');
  nav.innerHTML = `
      <a href="#/home">Home</a>
      <a href="#/add-story">Add Story</a>
      <a href="#/login">Logout</a>
    `;
  return nav;
};