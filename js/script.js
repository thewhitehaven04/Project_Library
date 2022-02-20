class Observable {
  #observers = [];

  subscribe(observer) {
    this.#observers.push(observer);
  }

  notify(data) {
    for (let observer of this.#observers) {
      observer(data);
    }
  }
}
class LibraryModel extends Observable {
  /** Stores objects of the Book class. */
  books = [];

  /** Adds a book to the library.
   * @param {Book} book - the book object to add to library.
   * @returns {Number} length - the book id.
   */
  addBook(book) {
    this.books.push(book);
    this.notify({
      event: 'add',
      obj: book,
    });
  }

  _getBookById(bookId) {
    return this.books.find((book) => book.id == bookId);
  }

  /** Removes a book from the library by its index.
   * @param {Book} book - index of the book to be removed.
   */
  removeBookById(bookId) {
    const book = this._getBookById(bookId);
    this.books.filter((libraryBook) => libraryBook == book);
    this.notify({
      event: 'remove',
      obj: book,
    });
  }
}

class LibraryController {
  constructor(view, model) {
    this.libraryView = view;
    this.libraryView.setupRemoveHandler(this.removeBook);

    this.libraryModel = model;
    this.libraryModel.subscribe(this.libraryView.updateDispatch);
  }

  addBook(book) {
    this.libraryModel.addBook(book);
  }

  removeBook = (bookId) => {
    this.libraryModel.removeBookById(bookId);
  };
}

class LibraryView {
  constructor() {
    this.libraryContainer = document.querySelector('.bookshelf__main-pane');

    this.bookClass = 'bookshelf__book';
    this.bookAttributeClass = 'book__attribute';
    this.bookRemoveButtonClass = 'book__button-remove';
  }

  setupRemoveHandler(removeHandler) {
    this.libraryContainer.addEventListener('click', (event) => {
      removeHandler(
        this._getBookId(event.target.closest(`.${this.bookRemoveButtonClass}`)),
      );
    });
  }

  _getBookId(button) {
    return button.dataset.id;
  }

  /** Implements reactions to events received from the model.
   * @param {Object} object - object containing the 'event' and the 'obj' keys
   */
  updateDispatch = (object) => {
    switch (object.event) {
      case 'add':
        this.addBook(object.obj);
        break;
      case 'remove':
        this.removeBook(object.obj);
        break;
    }
  };

  addBook(book) {
    const rootArticle = this._setupArticle(book);
    const removeButton = this._setupButton(book.id);

    rootArticle.appendChild(removeButton);
    this.libraryContainer.appendChild(rootArticle);
  }

  removeBook(book) {
    this.libraryContainer.removeChild(this._getBookFromDOM(book));
  }

  _getBookFromDOM(book) {
    return this.libraryContainer.querySelector(`#${book.id}`);
  }

  _setupArticle(book) {
    const rootArticle = document.createElement('article');
    rootArticle.classList.add(this.bookClass);

    for (let key in book)
      rootArticle.appendChild(this._renderKeyValuePair(key, book[key]));

    rootArticle.setAttribute('id', `${book.id}`);
    return rootArticle;
  }

  _renderKeyValuePair(bookParameter, bookValue) {
    const div = document.createElement('div');
    div.classList.add(this.bookAttributeClass);

    const spanKey = document.createElement('span');
    spanKey.textContent = `${bookParameter}:`;

    const spanValue = document.createElement('span');
    spanKey.textContent = `${bookValue}`;

    div.appendChild(spanKey);
    div.appendChild(spanValue);
    return div;
  }

  _setupButton(bookId) {
    const button = document.createElement('button');
    button.innerHTML = '<span class="material-icons-outlined">delete</span>';
    button.dataset.id = bookId;

    button.classList.add(this.bookRemoveButtonClass);

    return button;
  }
}

/** Constructs the Book object that has the following fields:
 * @param {String} title - title of the book;
 * @param {String} author - author of the book;
 * @param {Number} pageCount - the number of pages in the book;
 * @param {Number} yearOfPublishing - the number of pages in the book;
 * @param {Boolean} readStatus - whether the book has been read.
 */
class Book {
  static nextBookId = 0;
  #id;

  constructor(title, author, pageCount, yearOfPublishing, readStatus) {
    this.#id = `book-id-${Book.nextBookId}`;
    Book.nextBookId++;

    this.title = title;
    this.author = author;
    this.pageCount = pageCount;
    this.yearOfPublishing = yearOfPublishing;
    this.readStatus = readStatus;
  }

  get id() {
    return this.#id;
  }

  toJSON() {
    return {
      title: this.title,
      author: this.author,
      pageCount: this.pageCount,
      year: this.yearOfPublishing,
      status: this.readStatus,
    };
  }
}

let leviathanWakes = new Book(
  'Leviathan Wakes',
  'James S.A. Corey',
  577,
  2011,
  true,
);
let calibansWar = new Book(
  "Caliban's War",
  'James S.A. Corey',
  605,
  2012,
  true,
);
let abaddonsGate = new Book(
  "Abaddon's Gate",
  'James S.A. Corey',
  547,
  2013,
  false,
);
let cibolaBurn = new Book('Cibola Burn', 'James S.A. Corey', 591, 2014, false);
let nemesisGames = new Book(
  'Nemesis Games',
  'James S.A. Corey',
  536,
  2015,
  false,
);
let babylonsAshes = new Book(
  "Babylon's Ashes",
  'James S.A. Corey',
  544,
  2016,
  false,
);
let persepolisRising = new Book(
  'Persepolis Rising',
  'James. S.A. Corey',
  560,
  2017,
  false,
);
let tiamatsWrath = new Book(
  "Tiamat's Wrath",
  'James. S.A. Corey',
  560,
  2019,
  false,
);
let leviathanFalls = new Book(
  'Leviathan Falls',
  'James S.A. Corey',
  518,
  2021,
  false,
);

const libraryController = new LibraryController(
  new LibraryView(),
  new LibraryModel(),
);

[
  leviathanWakes,
  calibansWar,
  abaddonsGate,
  cibolaBurn,
  nemesisGames,
  babylonsAshes,
  persepolisRising,
  tiamatsWrath,
  leviathanFalls,
].forEach((someBook) => {
  libraryController.addBook(someBook);
});
