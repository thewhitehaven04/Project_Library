const bookshelf = document.querySelector('.bookshelf__main-pane');

const myLibrary = {
  books: [],

  /** Adds a book to the library.
   * @param {Book} book - the book object to add to library.
   * @returns {Number} length - the book id.
   */
  addBook(book) {
    this.books.push(book);
    return this.books.length - 1;
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
 * @param {Node} article - the article node
 * @returns {Element} button - the remove button element.
 */
function createRemoveButton(bookNumber, article) {
  const button = document.createElement('button');

  button.classList.add('book__button-remove');

  button.style.position = 'absolute';
  button.style.right = '15px';
  button.style.top = '15px';

  button.type = 'button';
  button.innerHTML = '<span class="material-icons-outlined">delete_outline</span>';

  button.addEventListener('click', event => {
    myLibrary.removeBook(bookNumber);
    const shelf = article.parentNode;
    shelf.removeChild(article);
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

  const removeButton = createRemoveButton(bookNumber, bookArticle);
  bookArticle.appendChild(removeButton);

  return bookArticle;
}

const buttonAddNew = document.querySelector('.header__button_type_add-new');
/** Implements the 'New book' button feature. */
buttonAddNew.addEventListener('click', event => {
  const form = document.querySelector('.form');
  form.classList.remove('form__disabled');

  // Cleanup input fields of the form
  ['#title', '#author', '#page-count', '#year'].forEach(id => {
    document.querySelector(id).textContent = '';
  });
  document.querySelector('#read-status').checked = false;
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

  // Put the book in the library.
  const bookId = myLibrary.addBook(book);

  // Add the book card to the shelf.
  const article = createArticle(book, bookId);
  bookshelf.appendChild(article);

  // Cleanup input fields of the form
  ['#title', '#author', '#page-count', '#year'].forEach(id => {
    document.querySelector(id).textContent = '';
  });
});

/** Initialize libary */
let leviathanWakes = new Book('Leviathan Wakes', 'James S.A. Corey', 577, 2011, true);
let calibansWar = new Book("Caliban's War", 'James S.A. Corey', 605, 2012, true);
let abaddonsGate = new Book("Abaddon's Gate", 'James S.A. Corey', 547, 2013, false);
let cibolaBurn = new Book('Cibola Burn', 'James S.A. Corey', 591, 2014, false);
let nemesisGames = new Book('Nemesis Games', 'James S.A. Corey', 536, 2015, false);
let babylonsAshes = new Book("Babylon's Ashes", 'James S.A. Corey', 544, 2016, false);
let persepolisRising = new Book(
  'Persepolis Rising',
  'James. S.A. Corey',
  560,
  2017,
  false
);
let tiamatsWrath = new Book("Tiamat's Wrath", 'James. S.A. Corey', 560, 2019, false);

[
  leviathanWakes,
  abaddonsGate,
  calibansWar,
  cibolaBurn,
  nemesisGames,
  babylonsAshes,
  persepolisRising,
  tiamatsWrath,
].forEach(someBook => {
  const bookId = myLibrary.addBook(someBook);
  const article = createArticle(someBook, bookId);
  bookshelf.appendChild(article);
});
