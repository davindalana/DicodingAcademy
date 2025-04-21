import "../components/header.js";

const baseURL = "https://notes-api.dicoding.dev/v2/";
const nodeListElement = document.querySelector("#log");
const formElement = document.querySelector("#form");
// membuat nodeitem
function createNodeItemElement({ id, title, body, createdAt }) {
  // Membuat container utama
  const container = document.createElement("div");
  container.classList.add("node-item");
  container.setAttribute("data-id", id);

  // Membuat elemen judul
  const titleElement = document.createElement("h3");
  titleElement.textContent = title;

  // Membuat elemen catatan
  const bodyElement = document.createElement("p");
  bodyElement.textContent = body;

  // Membuat elemen tanggal
  const dateElement = document.createElement("small");
  dateElement.textContent = `Created: ${new Date(createdAt).toLocaleDateString()}`;

  // Membuat tombol hapus
  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Hapus";
  deleteButton.addEventListener("click", async () => {
    const confirmDelete = confirm(
      "Apakah Anda yakin ingin menghapus catatan ini?",
    );
    if (confirmDelete) {
      const id = container.getAttribute("data-id");
      await deleteNote(id);
    }
  });

  // Menambahkan elemen ke dalam container
  container.appendChild(titleElement);
  container.appendChild(bodyElement);
  container.appendChild(dateElement);
  container.appendChild(deleteButton);

  return container;
}

async function getNotes() {
  try {
    const response = await fetch(`${baseURL}/notes`);
    const responseJson = await response.json();
    return responseJson.data;
  } catch (error) {
    console.error("Error fetching notes:", error);
  }
}

async function addNote(title, body) {
  try {
    showLoading();
    const option = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body }),
    };
    const response = await fetch(`${baseURL}/notes`, option);
    const responseJson = await response.json();
    if (responseJson.status === "success") {
      alert("Catatan berhasil ditambahkan.");
      await renderNotes();
    } else {
      alert("Gagal menambahkan catatan: " + responseJson.message);
    }
  } catch (error) {
    console.error("Error adding note:", error);
  } finally {
    hideLoading();
  }
}

async function deleteNote(noteId) {
  try {
    const option = {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    };
    const response = await fetch(`${baseURL}/notes/${noteId}`, option);
    const responseJson = await response.json();
    if (responseJson.status === "success") {
      alert("Catatan berhasil dihapus.");
      await renderNotes();
    } else {
      alert("Gagal menghapus catatan: " + responseJson.message);
    }
  } catch (error) {
    console.error("Error deleting note:", error);
  }
}

async function renderNotes() {
  try {
    showLoading();
    const notes = await getNotes();
    nodeListElement.innerHTML = "";
    notes.forEach((note) => {
      const element = createNodeItemElement(note);
      nodeListElement.appendChild(element);
    });
  } catch (error) {
    alert("Gagal memuat catatan.");
  } finally {
    hideLoading();
  }
}

const loadingIndicator = document.getElementById("loading");

function showLoading() {
  if (loadingIndicator) loadingIndicator.style.display = "block";
}

function hideLoading() {
  if (loadingIndicator) loadingIndicator.style.display = "none";
}
document.addEventListener("DOMContentLoaded", () => {
  const titleInput = document.querySelector("#title");
  const bodyInput = document.querySelector("#body");
  formElement.addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();

    if (!title || !body) {
      alert("Judul dan isi catatan tidak boleh kosong!");
      return;
    }
    await addNote(title, body);
    formElement.reset();
  });
  renderNotes();
});
