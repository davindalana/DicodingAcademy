import { notesData } from "./data/data.js";

const nodeListElement = document.querySelector('#log');
const formElement = document.querySelector('#form');

// membuat nodeitem
function createNodeItemElement({ id, title, body, createdAt, archived }) {
    // Membuat container utama
    const container = document.createElement('div');
    container.classList.add('node-item');
    container.setAttribute('data-id', id);

    // Membuat elemen judul
    const titleElement = document.createElement('h3');
    titleElement.textContent = title;

    // Membuat elemen catatan
    const bodyElement = document.createElement('p');
    bodyElement.textContent = body;

    // Membuat elemen tanggal
    const dateElement = document.createElement('small');
    dateElement.textContent = `Created: ${new Date(createdAt).toLocaleDateString()}`;

    // Membuat status archived
    const archiveStatus = document.createElement('p');
    archiveStatus.textContent = archived ? 'Status: Archived' : 'Status: Active';
    archiveStatus.style.color = archived ? 'red' : 'green';

    // Membuat tombol hapus
    const deleteButton = document.createElement("delete-button");
    container.appendChild(deleteButton);

    // Menambahkan elemen ke dalam container
    container.appendChild(titleElement);
    container.appendChild(bodyElement);
    container.appendChild(dateElement);
    container.appendChild(archiveStatus);
    container.appendChild(deleteButton);

    return container;
}

if (nodeListElement) {
    notesData.forEach((data) => {
        const element = createNodeItemElement(data);
        nodeListElement.appendChild(element);
    });
}

formElement.addEventListener('submit', (event) => {
    event.preventDefault();

    const customTitleInput = document.querySelector('custom-input-title[id="title"]');
    const customBodyInput = document.querySelector('custom-input-body[id="body"]');

    const titleInput = customTitleInput?.shadowRoot.querySelector('input');
    const bodyInput = customBodyInput?.shadowRoot.querySelector('textarea');

    const newNote = {
        id: `notes-${Date.now()}`,
        title: titleInput.value,
        body: bodyInput.value,
        createdAt: new Date().toISOString(),
        archived: false
    };

    notesData.push(newNote);

    const newElement = createNodeItemElement(newNote);
    nodeListElement.appendChild(newElement);

    titleInput.value = '';
    bodyInput.value = '';
});