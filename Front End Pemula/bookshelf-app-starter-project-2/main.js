document.addEventListener("DOMContentLoaded", function () {
    const bookForm = document.getElementById("bookForm");
    const searchForm = document.getElementById("searchBook");
    const incompleteBookList = document.getElementById("incompleteBookList");
    const completeBookList = document.getElementById("completeBookList");

    let books = JSON.parse(localStorage.getItem("books")) || [];

    function saveBooks() {
        localStorage.setItem("books", JSON.stringify(books));
    }

    function createBookElement(book) {
        const bookElement = document.createElement("div");
        bookElement.classList.add("book-item");
        bookElement.setAttribute("data-bookid", book.id);
        bookElement.setAttribute("data-testid", "bookItem");

        bookElement.innerHTML = `
            <h3 data-testid="bookItemTitle">${book.title}</h3>
            <p data-testid="bookItemAuthor">Penulis: ${book.author}</p>
            <p data-testid="bookItemYear">Tahun: ${book.year}</p>
            <div class="book-actions">
                <button class="btn toggle-status" data-testid="bookItemIsCompleteButton">
                    ${book.isComplete ? "Belum selesai" : "Selesai dibaca"}
                </button>
                <button class="btn edit" data-testid="bookItemEditButton">Edit</button>
                <button class="btn delete" data-testid="bookItemDeleteButton">Hapus</button>
            </div>
        `;

        bookElement.querySelector(".toggle-status").addEventListener("click", () => {
            book.isComplete = !book.isComplete;
            saveBooks();
            renderBooks();
        });

        bookElement.querySelector(".delete").addEventListener("click", () => {
            books = books.filter((b) => b.id !== book.id);
            saveBooks();
            renderBooks();
        });

        bookElement.querySelector(".edit").addEventListener("click", () => {
            openEditForm(book);
        });

        return bookElement;
    }

    function renderBooks() {
        incompleteBookList.innerHTML = "";
        completeBookList.innerHTML = "";

        books.forEach((book) => {
            const bookElement = createBookElement(book);
            if (book.isComplete) {
                completeBookList.appendChild(bookElement);
            } else {
                incompleteBookList.appendChild(bookElement);
            }
        });
    }

    function isDuplicateBook(title, author) {
        return books.some(
            (book) => book.title.toLowerCase() === title.toLowerCase() &&
                book.author.toLowerCase() === author.toLowerCase()
        );
    }

    function openEditForm(book) {
        const newTitle = prompt("Masukkan judul baru:", book.title)?.trim();
        const newAuthor = prompt("Masukkan penulis baru:", book.author)?.trim();
        let newYear = prompt("Masukkan tahun baru:", book.year)?.trim();

        if (!newTitle || !newAuthor || !newYear) {
            alert("Semua data harus diisi!");
            return;
        }

        if (isNaN(newYear) || parseInt(newYear) < 0) {
            alert("Tahun harus berupa angka yang valid!");
            return;
        }

        book.title = newTitle;
        book.author = newAuthor;
        book.year = parseInt(newYear);
        saveBooks();
        renderBooks();
    }

    bookForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const title = document.getElementById("bookFormTitle").value.trim();
        const author = document.getElementById("bookFormAuthor").value.trim();
        const year = document.getElementById("bookFormYear").value.trim();
        const isComplete = document.getElementById("bookFormIsComplete").checked;

        if (!title || !author || !year) {
            alert("Semua bidang harus diisi!");
            return;
        }

        if (isNaN(year) || parseInt(year) < 0) {
            alert("Tahun harus berupa angka yang valid!");
            return;
        }

        if (isDuplicateBook(title, author)) {
            alert("Buku ini sudah ada dalam daftar!");
            return;
        }

        const newBook = {
            id: +new Date(),
            title,
            author,
            year: parseInt(year),
            isComplete,
        };

        books.push(newBook);
        saveBooks();
        renderBooks();
        bookForm.reset();
    });

    searchForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const searchTitle = document.getElementById("searchBookTitle").value.toLowerCase();
        const filteredBooks = books.filter((book) => book.title.toLowerCase().includes(searchTitle));

        incompleteBookList.innerHTML = "";
        completeBookList.innerHTML = "";

        filteredBooks.forEach((book) => {
            const bookElement = createBookElement(book);
            if (book.isComplete) {
                completeBookList.appendChild(bookElement);
            } else {
                incompleteBookList.appendChild(bookElement);
            }
        });
    });

    renderBooks();
});
