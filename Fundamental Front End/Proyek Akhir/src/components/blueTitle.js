class CustomTitleBlue extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const title = this.getAttribute('title') || 'Default Title'; 

        this.shadowRoot.innerHTML = `
      <style>
        h2 {
          color: #27548a;
          font-size: 30px;
          margin-bottom: 20px;
        }
      </style>
      <h2>${title}</h2>
    `;
    }
}

customElements.define('custom-title-blue', CustomTitleBlue);