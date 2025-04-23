class CustomTitleYellow extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const title = this.getAttribute('title') || 'Default Title'; // Default title if not provided
    this.shadowRoot.innerHTML = `
      <style>
        h2 {
          color: #f5eedc;
          font-size: 30px;
          margin-bottom: 20px;
          text-align: center;
          text-shadow: 2px 2px 4px #183b4e;
        }
      </style>
      <h2>${title}</h1>
    `;
  }
}
customElements.define('custom-title-yellow', CustomTitleYellow);