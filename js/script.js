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

  toggleReadStatus(bookId) {
    this.books.find((book) => book.id == bookId).toggleReadStatus();
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
  constructor(libraryView, addFormView, model) {
    this.libraryView = libraryView;
    this.libraryView.setupRemoveHandler(this.removeBook);

    this.addFormView = addFormView;

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
    this.readStateToggleClass = 'book__button-read-toggle';
  }

  setupRemoveHandler(removeHandler) {
    this.libraryContainer.addEventListener('click', (event) => {
      removeHandler(
        this._getBookId(event.target.closest(`.${this.bookRemoveButtonClass}`)),
      );
    });
  }

  setupToggleHandler(toggleHandler) {
    this.libraryContainer.addEventListener('click', (event) => {
      toggleHandler(
        this._getBookId(event.target.closest(`.${this.readStateToggleClass}`)),
      );
    });
  }

  _getBookId(element) {
    return element.dataset.id;
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
    const toggleRead = this._setupToggle(book.id);
    const removeButton = this._setupButton(book.id);

    rootArticle.appendChild(removeButton);
    rootArticle.appendChild(toggleRead);
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

    const bookJson = book.toJSON();
    for (let key in bookJson) {
      const div = this._renderKeyValuePair(key, bookJson[key]);
      if (div) rootArticle.appendChild(div);
    }
    rootArticle.setAttribute('id', `${book.id}`);
    return rootArticle;
  }

  /** Displays text fields.
   * @param {String} bookKey - the attribute name of the Book's instance JSON representation
   * @parma {String} bookValue - the value
   */
  _renderKeyValuePair(bookKey, bookValue) {
    const keyToDisplayMapper = {
      title: 'Title',
      author: 'Author',
      pageCount: 'Pages',
      yearOfPublishing: 'Year',
    };

    // Handles only text fields. Read status checkbox is handled in another method.
    if (bookKey in keyToDisplayMapper) {
      const div = document.createElement('div');
      div.classList.add(this.bookAttributeClass);

      const spanKey = document.createElement('span');
      spanKey.textContent = `${keyToDisplayMapper[bookKey]}:`;

      const spanValue = document.createElement('span');
      spanValue.textContent = `${bookValue}`;

      div.appendChild(spanKey);
      div.appendChild(spanValue);
      return div;
    }
  }

  _setupButton(bookId) {
    const button = document.createElement('button');
    button.innerHTML = '<span class="material-icons-outlined">delete</span>';
    button.dataset.id = bookId;
    button.classList.add(this.bookRemoveButtonClass);

    return button;
  }

  _setupToggle(bookId) {
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.dataset.id = bookId;
    input.id = `book-${bookId}`;
    input.classList.add(this.readStateToggleClass);

    return input;
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

  toggleReadStatus = () => {
    this.readStatus = !this.readStatus;
  };

  get id() {
    return this.#id;
  }

  toJSON() {
    return {
      title: this.title,
      author: this.author,
      pageCount: this.pageCount,
      yearOfPublishing: this.yearOfPublishing,
      status: this.readStatus,
    };
  }
}

class AddBookFormView {
  constructor() {
    this.newBookFormButton = document.querySelector(
      '.header__button_type_add-new',
    );

    this.newBookForm = document.querySelector('.form');
    this.newBookFormDisabledClass = 'form__disabled';
    this.newBookFormEnabled = false;

    this._newFormOpenerInit(this.newBookFormButton);

    this.newBookFormFields = {
      title: document.querySelector('#title'),
      author: document.querySelector('#author'),
      pages: document.querySelector('#page-count'),
      year: document.querySelector('#year'),
      status: document.querySelector('#read-status'),
    };
  }

  _newFormOpenerInit(button) {
    button.addEventListener('click', () => {
      this.newBookForm.classList.remove(this.newBookFormDisabledClass);
    });
  }

  acceptHandler() {}

  _cleanFields() {
    for (field of this.newBookFormFields) {
      field.value = '';
    }
  }

  cancelHandler() {
    this._cleanFields();
    this.newBookForm.classList.add(this.newBookFormDisabledClass);
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
  new AddBookFormView(),
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
