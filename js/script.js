let myLibrary = [];

/** Constructs the Book object that has the following fields:
 * @param {String} title - title of the book;
 * @param {String} author - author of the book;
 * @param {Number} pageCount - the number of pages in the book;
 * @param {Number} yearOfPublishing - the number of pages in the book;
 * @param {Boolean} readStatus - whether the book has been read.
 */
function Book(title, author, pageCount, yearOfPublishing, readStatus) {
  this.title = title;
  this.author = author;
  this.pageCount = pageCount;
  this.yearOfPublishing = yearOfPublishing;
  this.readStatus = readStatus;
}

Book.prototype.setRead = function (readStatus) {
  this.readStatus = readStatus;
};

/** Append a book to the library.
 * @param book - the Book object
 */
function addBookToLibrary(book) {
  myLibrary.push(book);
}

let leviathanWakes = new Book(
  "Leviathan Wakes",
  "James S.A. Corey",
  577,
  2011,
  true
);
let abaddonsGate = new Book(
  "Abaddon's Gate",
  "James S.A. Corey",
  547,
  2013,
  false
);
let cibolaBurn = new Book("Cibola Burn", "James S.A. Corey", 591, 2014, false);

[leviathanWakes, abaddonsGate, cibolaBurn].forEach((someBook) => {
  addBookToLibrary(someBook);
});

function createArticle(book) {
  let bookArticle = document.createElement("article");
  bookArticle.classList.add("bookshelf__book");

  const bookAttributeToDisplayName = {
    title: "Title:",
    author: "Author:",
    pageCount: "Pages:",
    yearOfPublishing: "Published:",
    readStatus: "Already read:",
  };

  for (attribute in bookAttributeToDisplayName) {
    const bookData = document.createElement("div");
    bookData.classList.add("book__info-entry");

    const spanKey = document.createElement("span");
    spanKey.style.width = "120px";
    spanKey.textContent = bookAttributeToDisplayName[attribute];

    const spanValue = document.createElement("span");
    spanValue.textContent = book[attribute];

    bookData.appendChild(spanKey);
    bookData.appendChild(spanValue);

    bookArticle.appendChild(bookData);
  }

  return bookArticle;
}

const bookshelf = document.querySelector(".bookshelf");

for (let someBook of myLibrary) {
  article = createArticle(someBook);
  bookshelf.appendChild(article);
}

const button = document.querySelector(".bookshelf__add-new");

button.addEventListener('click', (event) => {
  const form = document.querySelector('.form-new-book');

  form.classList.remove('form-new-book__disabled');
})