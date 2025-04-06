class CustomHeader extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: "open" })
        const header = document.createElement('header');
        header.textContent = this.getAttribute('title');

        const style = document.createElement('style');
        style.textContent = `
            header {
                background: #27548A;
                padding: 16px;
                color: #F5EEDC;
                text-align: center;
                font-size: 1.5rem;
                font-weight: bold;
            }
        `;

        shadow.appendChild(style);
        shadow.appendChild(header);
    }
}

customElements.define('custom-header', CustomHeader);