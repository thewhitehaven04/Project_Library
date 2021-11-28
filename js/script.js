const bookshelf = document.querySelector('.bookshelf');

const myLibrary = {
  books: [],

  /** Adds a book to the library.
   * @param {Book} book - the book object to add to library.
   */
  addBook(book) {
    this.books.push(book);
    const article = createArticle(book, this.books.length - 1);
    bookshelf.appendChild(article);
  },
  /** Removes a book from the library by its index.
   * @param {Number} bookIndex - index of the book to be removed.
   */
  removeBook(bookIndex) {
    this.books.splice(bookIndex, 1);
  },
};

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

/** Toggles the read state of a book.
 * @param {Boolean} readStatus - the read status of the book.
 */
Book.prototype.setRead = function (readStatus) {
  this.readStatus = readStatus;
};

/** Returns remove button element with a bookId property attached to it.
 * @param {Number} bookNumber - the library book index;
 * @returns {Element} button - the remove button element.
 */
function createRemoveButton(bookNumber) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Remove';

  button.addEventListener('click', event => {
    myLibrary.removeBook(bookNumber);
  });
  return button;
}

function createArticle(book, bookNumber) {
  let bookArticle = document.createElement('article');
  bookArticle.classList.add('bookshelf__book');

  const bookAttributeToDisplayName = {
    title: 'Title:',
    author: 'Author:',
    pageCount: 'Pages:',
    yearOfPublishing: 'Published:',
    readStatus: 'Already read:',
  };

  for (attribute in bookAttributeToDisplayName) {
    const bookData = document.createElement('div');
    bookData.classList.add('book__info-entry');

    const spanKey = document.createElement('span');
    spanKey.style.width = '120px';
    spanKey.textContent = bookAttributeToDisplayName[attribute];

    const spanValue = document.createElement('span');
    spanValue.textContent = book[attribute];

    bookData.appendChild(spanKey);
    bookData.appendChild(spanValue);

    bookArticle.appendChild(bookData);
  }

  const removeButton = createRemoveButton(bookNumber);
  bookArticle.appendChild(removeButton);

  return bookArticle;
}

const buttonAddNew = document.querySelector('.bookshelf__add-new');
buttonAddNew.addEventListener('click', event => {
  const form = document.querySelector('.form');
  form.classList.remove('form__disabled');
});

const buttonCancel = document.querySelector('.form-new-book__button_type_cancel');
buttonCancel.addEventListener('click', event => {
  const form = document.querySelector('.form');
  form.classList.add('form__disabled');

  // Cleanup input fields of the form
  ['#title', '#author', '#page-count', '#year'].forEach(id => {
    document.querySelector(id).textContent = '';
  });
  document.querySelector('#read-status').checked = false;
});

const buttonAccept = document.querySelector('.form-new-book__button_type_accept');
/** The listener adds a new book to the library */
buttonAccept.addEventListener('click', event => {
  const args = ['#title', '#author', '#page-count', '#year'];
  const book = new Book(
    ...args.map(arg => document.querySelector(arg).value),
    document.querySelector('#read-status').checked
  );

  myLibrary.addBook(book);
});

let leviathanWakes = new Book('Leviathan Wakes', 'James S.A. Corey', 577, 2011, true);
let abaddonsGate = new Book("Abaddon's Gate", 'James S.A. Corey', 547, 2013, false);
let cibolaBurn = new Book('Cibola Burn', 'James S.A. Corey', 591, 2014, false);

[leviathanWakes, abaddonsGate, cibolaBurn].forEach(someBook => {
  myLibrary.addBook(someBook);
});
