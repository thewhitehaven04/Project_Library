class Observable {
  #observers = [];

  /** Add an object to observers. */
  subscribe(observer) {
    this.#observers.push(observer);
  }

  notify(data) {
    for (let observer of this.#observers) observer(data);
  }
}
class LibraryModel extends Observable {
  /** Stores objects of the Book class. */
  books = [];
  nextBookId = 0;

  /** Adds a book to the library.
   * @param {Book} book - the book object to add to library.
   * @returns {Number} length - the book id.
   */
  addBook(book) {
    this.books.push({ id: this.nextBookId, book });
    this.notify({ event: 'add', obj: book });
    this.nextBookId++;
  }

  /** Removes a book from the library by its index.
   * @param {Book} book - index of the book to be removed.
   */
  removeBook(book) {
    this.books.filter((libraryBook) => libraryBook != book);
    this.notify({ event: 'remove', obj: book });
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

  removeBook = (book) => {
    this.libraryModel.removeBook(book);
  }
}

class LibraryView {
  constructor() {
    this.libraryContainer = document.querySelector('.bookshelf__main-pane');
    this.bookRemoveButtonClass = 'book__button-remove';
  }

  setupRemoveHandler(removeHandler) {
    this.libraryContainer.addEventListener('click', (event) => {
      removeHandler(event.target.closest(`.${this.bookRemoveButtonClass}`).parentElement);
    });
  }

  setupToggleHandler(toggleHandler) {
    this.libraryContainer.addEventListener('click', (event) => {
      toggleHandler(this.#getBookId(event.target.closest(`.${this.readStateToggleClass}`)));
    });
  }

  #getBookId(element) {
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
    const renderedBook = book.render();
    this.#addRemoveButtonToBook(renderedBook);
    this.libraryContainer.appendChild(renderedBook);
  }

  removeBook(book) {
    this.libraryContainer.removeChild(book);
  }

  #addRemoveButtonToBook(bookElement) {
    const button = document.createElement('button');
    button.innerHTML = '<span class="material-icons-outlined">delete</span>';
    button.classList.add(this.bookRemoveButtonClass);

    bookElement.appendChild(button);
  }
}

/** Constructs the Book object that has the following fields:
 * @param {String} title - title of the book;
 * @param {String} author - author of the book;
 * @param {Number} pageCount - the number of pages in the book;
 * @param {Number} yearOfPublishing - the number of pages in the book;
 * @param {Boolean} readStatus - whether the book has been read.
 */
class BookFactoryController {
  constructor(view, model) {
    this.view = view;
    this.model = model;
  }

  /** Returns a new book object that contains the 'render' method. */
  createNewBook(title, author, pageCount, yearOfPublishing, readStatus) {
    const bookModel = new this.model(title, author, pageCount, yearOfPublishing, readStatus);

    const handleToggle = () => bookModel.toggleReadStatus();
    const bookView = new this.view(bookModel.toJSON(), handleToggle);

    bookModel.subscribe(bookView.toggleReadStatus);

    const render = () => bookView.render();
    return { render };
  }
}

class BookModel extends Observable {
  constructor(title, author, pageCount, yearOfPublishing, readStatus) {
    super();

    this.title = title;
    this.author = author;
    this.pageCount = pageCount;
    this.yearOfPublishing = yearOfPublishing;
    this.readStatus = readStatus;
  }

  toggleReadStatus = () => {
    this.readStatus = !this.readStatus;
  };

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

/** Displays the book with its attributes and toggles. */
class BookView {
  constructor(bookJSON, toggleEventHandler) {
    this.bookClass = 'bookshelf__book';
    this.rootElement = document.createElement('article');
    this.rootElement.classList.add(this.bookClass);

    // Appends text fields
    this.bookAttributeClass = 'book__attribute';
    this.#setupTextFields(bookJSON).forEach((textField) => this.rootElement.appendChild(textField));

    // Appends status toggle
    this.readStateToggleClass = 'book__button-read-toggle';

    // Attaches an event handler that binds the book's read status to the value of its model.
    this.toggleStatusInput = this.#setupReadStatus(bookJSON);
    this.toggleStatusInput.addEventListener('click', (event) => {
      toggleEventHandler();
    });
    this.rootElement.appendChild(this.toggleStatusInput);
  }

  /** Renders the book's text attributes (year of publishing, title, author, etc.)
   * @param {String} bookKey - an attribute;
   * @param {String} value - attribute's value
   *
   * @returns {Node} div
   */
  _renderBookAttribute(bookKey, bookValue) {
    const div = document.createElement('div');
    div.classList.add(this.bookAttributeClass);

    const spanKey = document.createElement('span');
    spanKey.textContent = `${bookKey}:`;

    const spanValue = document.createElement('span');
    spanValue.textContent = bookValue;

    div.appendChild(spanKey);
    div.appendChild(spanValue);
    return div;
  }

  #setupTextFields(bookJson) {
    const textFieldsMapper = {
      title: 'Title',
      author: 'Author',
      pageCount: 'Page count',
      yearOfPublishing: 'Year of publishing',
    };

    const bookAttributeElements = [];
    for (const [key, value] of Object.entries(bookJson)) {
      if (Object.keys(textFieldsMapper).includes(key)) {
        bookAttributeElements.push(this._renderBookAttribute(textFieldsMapper[key], value));
      }
    }
    return bookAttributeElements;
  }

  #setupReadStatus(bookJson) {
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = bookJson['status'];
    input.classList.add(this.readStateToggleClass);

    return input;
  }

  toggleReadStatus = () => {
    !this.toggleStatusInput.checked;
  };
  render = () => this.rootElement;
}

class AddBookFormView {
  constructor() {
    this.newBookFormButton = document.querySelector('.header__button_type_add-new');

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

const bookFactoryController = new BookFactoryController(BookView, BookModel);

let leviathanWakes = bookFactoryController.createNewBook('Leviathan Wakes', 'James S.A. Corey', 577, 2011, true);
let calibansWar = bookFactoryController.createNewBook("Caliban's War", 'James S.A. Corey', 605, 2012, true);
let abaddonsGate = bookFactoryController.createNewBook("Abaddon's Gate", 'James S.A. Corey', 547, 2013, false);
let cibolaBurn = bookFactoryController.createNewBook('Cibola Burn', 'James S.A. Corey', 591, 2014, false);
let nemesisGames = bookFactoryController.createNewBook('Nemesis Games', 'James S.A. Corey', 536, 2015, false);
let babylonsAshes = bookFactoryController.createNewBook("Babylon's Ashes", 'James S.A. Corey', 544, 2016, false);
let persepolisRising = bookFactoryController.createNewBook('Persepolis Rising', 'James. S.A. Corey', 560, 2017, false);
let tiamatsWrath = bookFactoryController.createNewBook("Tiamat's Wrath", 'James. S.A. Corey', 560, 2019, false);
let leviathanFalls = bookFactoryController.createNewBook('Leviathan Falls', 'James S.A. Corey', 518, 2021, false);

const libraryController = new LibraryController(new LibraryView(), new AddBookFormView(), new LibraryModel());

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
