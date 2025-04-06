class DeleteButton extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        this.render();
        this.shadowRoot.querySelector("button").addEventListener("click", () => {
            this.dispatchEvent(new Event("delete-note", { bubbles: true, composed: true }));
            this.parentElement.remove();
        });
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                button {
                    background-color: red;
                    color: white;
                    border: none;
                    padding: 8px;
                    cursor: pointer;
                    border-radius: 4px;
                }
                button:hover {
                    background-color: darkred;
                }
            </style>
            <button>Hapus</button>
        `;
    }
}

customElements.define("delete-button", DeleteButton);