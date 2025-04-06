class CustomInputBody extends HTMLElement {
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
                    gap: 5px;
                    grid-template-columns: 1fr;
                    align-items: center;
                    font-family: Arial, sans-serif;
                }
                label {
                    font-weight: bold;
                    color: #27548A;
                }
                textarea {
                    border: 2px solid #183B4E; 
                    border-radius: 10px;
                    font-size: 14px;
                    background-color: #F5EEDC; 
                    color: #183B4E; 
                    padding: 10px;
                    width: 100%;
                    height: 120px;
                    resize: vertical;
                    box-sizing: border-box;
                }
                textarea:focus {
                    outline: none;
                    border-color: #DDA853; 
                    box-shadow: 0 0 5px #DDA853;
                }
            </style>
            <div class="input-wrapper">
            <label for="${inputId}">${labelText}</label>
            <textarea id="${inputId}" name="${inputName}" required></textarea>
            </div>
        `;
    }
    get inputElement() {
        return this.shadowRoot.querySelector('textarea');
    };
}

// Mendaftarkan custom element
customElements.define('custom-input-body', CustomInputBody);