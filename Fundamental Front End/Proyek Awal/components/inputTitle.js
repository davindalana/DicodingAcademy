class CustomInputTitle extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        const labelText = this.getAttribute('label');
        const inputId = this.getAttribute('id');
        const inputName = this.getAttribute('name');

        this.shadowRoot.innerHTML = `
            <style>
                .input-wrapper {
                display: grid;
                grid-template-columns: 1fr;
                gap: 5px;
                align-items: center;
                font-family: Arial, sans-serif;
            }
            label {
                font-weight: bold;
                color: #27548A;
            }
            input {
                border: 2px solid #183B4E; 
                border-radius: 10px;
                font-size: 14px;
                background-color: #F5EEDC; 
                color: #183B4E; 
                width: 100%;
                box-sizing: border-box;
            }
            input[name="title"] {
                padding:10px;
            }
            input:focus {
                outline: none;
                border-color: #DDA853; 
                box-shadow: 0 0 5px #DDA853;
            }
            </style>
            <div class="input-wrapper">
            <label for="${inputId}">${labelText}</label>
            <input type="text" id="${inputId}" name="${inputName}" required>
            </div>
        `;
    }
    get inputElement() {
        return this.shadowRoot.querySelector('input');
    };
}

// Mendaftarkan custom element
customElements.define('custom-input-title', CustomInputTitle);