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
  constructor(libraryView, addFormView, model, factory) {
    this.libraryView = libraryView;
    this.libraryView.setupRemoveHandler(this.removeBook);

    this.addFormView = addFormView;
    this.addFormView.acceptButtonHandler(this.addBook);

    this.libraryModel = model;
    this.libraryModel.subscribe(this.libraryView.updateDispatch);

    this.bookFactory = factory;
  }

  addBook = (title, author, pageCount, yearOfPublishing, status) => {
    const book = this.bookFactory.createNewBook(title, author, pageCount, yearOfPublishing, status);
    this.libraryModel.addBook(book);
  };

  removeBook = (book) => {
    this.libraryModel.removeBook(book);
  };
}

class LibraryView {
  constructor() {
    this.libraryContainer = document.querySelector('.bookshelf__main-pane');
    this.bookRemoveButtonClass = 'book__button-remove';
  }

  /** Sets up book removal handler. Accepts controller book removal handler as the parameter. */
  setupRemoveHandler(removeHandler) {
    this.libraryContainer.addEventListener('click', (event) => {
      const closest = event.target.closest(`.${this.bookRemoveButtonClass}`).parentElement;
      removeHandler(closest);
    });
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

  /** Add a rendered book to the library's view.
   * @param {Book} book - an object that has a `render` method that returns an object of type Element 
   */
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

  /** Toggles */
  toggleReadStatus = () => {
    this.readStatus = !this.readStatus;
    this.notify(this.readStatus);
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
    // Constructs the root element of the book
    this.bookClass = 'bookshelf__book';
    this.rootElement = document.createElement('article');
    this.rootElement.classList.add(this.bookClass);

    // Appends text fields
    this.bookAttributeClass = 'book__attribute';
    this.#setupTextFields(bookJSON).forEach((textField) => this.rootElement.appendChild(textField));

    // Appends status toggle
    this.readStateButtonClass = 'book__button_read-button';
    this.readStateLabelClass = 'book__button_read-label';
    this.activeToggleClass = 'book__button_read-label_active';

    this.readLabel = '<span class="material-icons-outlined">done</span>';
    this.notReadLabel = '<span class="material-icons-outlined">close</span>';


    // Attaches an event handler that binds the book's read status to the value of its model.
    this.readEventHandler = toggleEventHandler;
    this.toggleStatusLabel = this.#attachReadStatus(bookJSON['status'], toggleEventHandler);
    this.rootElement.appendChild(this.toggleStatusLabel);
  }

  #attachReadStatus(status, eventHandler) {
    const div = this.#setupReadStatus(status);
    div.addEventListener('click', (event) => {
      event.stopPropagation();
      eventHandler();
    });
    return div;
  }

  /** Renders the book's text attributes (year of publishing, title, author, etc.)
   * @param {String} bookKey - an attribute;
   * @param {String} value - the attribute's value
   *
   * @returns {Node} div
   */
  _renderBookAttribute(bookKey, bookValue) {
    const div = document.createElement('div');
    div.classList.add(this.bookAttributeClass);

    const spanKey = document.createElement('span');
    spanKey.classList.add('book__attribute_type-key');
    spanKey.textContent = `${bookKey}:`;

    const spanValue = document.createElement('span');
    spanValue.classList.add('book__attribute_type-value');
    spanValue.textContent = bookValue;

    div.appendChild(spanKey);
    div.appendChild(spanValue);
    return div;
  }

  /** Sets up the book's text attributes. */
  #setupTextFields(bookJson) {
    const textFieldsMapper = {
      title: 'Title',
      author: 'Author',
      pageCount: 'Pages',
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

  /** Sets up the read status checkbox of the book card. */
  #setupReadStatus(status) {
    const divRoot = document.createElement('div');
    divRoot.classList.add('book__button_read');

    const button = document.createElement('button');
    button.classList.add(this.readStateButtonClass);

    if (status == true) {
      button.innerHTML = this.readLabel;
      button.style.setProperty('color', 'green');
    } else {
      button.innerHTML = this.notReadLabel;
      button.style.setProperty('color', 'red');
    }

    const label = document.createElement('label');
    label.classList.add(this.readStateLabelClass);
    label.textContent = 'Read: ';

    divRoot.appendChild(label);
    divRoot.appendChild(button);
    return divRoot;
  }

  /** Toggles the read status to the opposite one upon receiving
   * the event from the model. */
  toggleReadStatus = (status) => {
    const newToggle = this.#attachReadStatus(status, this.readEventHandler);
    this.rootElement.replaceChild(newToggle, this.toggleStatusLabel);
    this.toggleStatusLabel = newToggle;
  };
  render = () => this.rootElement;
}

class AddBookFormView {
  constructor() {
    this.main = document.querySelector('main');
    this.newBookFormButton = document.querySelector('.header__button_type_add-new');

    this.newBookForm = document.querySelector('.form');
    this.newBookFormDisabledClass = 'form__disabled';
    this.newBookFormEnabled = false;
    this.overlay = document.querySelector('.overlay');

    this._newFormOpenerInit(this.newBookFormButton);

    this.newBookFormFields = {
      title: document.querySelector('#title'),
      author: document.querySelector('#author'),
      pages: document.querySelector('#page-count'),
      year: document.querySelector('#year'),
      status: document.querySelector('#read-status'),
    };

    this.acceptButton = document.querySelector('.form-new-book__button_type_accept');

    this.cancelButton = document.querySelector('.form-new-book__button_type_cancel');
    this.cancelButton.addEventListener('click', (event) => this.cancelHandler());
  }

  applyDarken = () => {
    this.overlay.classList.add('overlay__darken');
  }
  
  removeDarken = () => {
    this.overlay.classList.remove('overlay__darken');
  }

  _newFormOpenerInit(button) {
    button.addEventListener('click', () => {
      this.newBookForm.classList.remove(this.newBookFormDisabledClass);
      this.applyDarken();
    });
  }

  /** Reads values from the form aand passes them as arguments into the addBook handler
   * @param {Function} addBook - controller function to call when adding the new book
   */
  acceptButtonHandler(addBook) {
    this.acceptButton.addEventListener('click', () => {
      const title = this.newBookFormFields['title'].value;
      const author = this.newBookFormFields['author'].value;
      const pages = this.newBookFormFields['pages'].value;
      const year = this.newBookFormFields['year'].value;
      const status = this.newBookFormFields['status'].checked;
      addBook(title, author, pages, year, status);
    });
  }

  /** Helper function that cleans input fields of the form. */
  _cleanFields() {
    for (let field in this.newBookFormFields) {
      this.newBookFormFields[field].value = '';
    }
  }

  /** Hides the book addition input form. */
  cancelHandler() {
    this._cleanFields();
    this.newBookForm.classList.add(this.newBookFormDisabledClass);
    this.removeDarken();
  }
}

const bookFactoryController = new BookFactoryController(BookView, BookModel);
const libraryController = new LibraryController(
  new LibraryView(),
  new AddBookFormView(),
  new LibraryModel(),
  new BookFactoryController(BookView, BookModel),
);

let leviathanWakes = libraryController.addBook('Leviathan Wakes', 'James S.A. Corey', 577, 2011, true);
let calibansWar = libraryController.addBook("Caliban's War", 'James S.A. Corey', 605, 2012, true);
let abaddonsGate = libraryController.addBook("Abaddon's Gate", 'James S.A. Corey', 547, 2013, false);
let cibolaBurn = libraryController.addBook('Cibola Burn', 'James S.A. Corey', 591, 2014, false);
let nemesisGames = libraryController.addBook('Nemesis Games', 'James S.A. Corey', 536, 2015, false);
let babylonsAshes = libraryController.addBook("Babylon's Ashes", 'James S.A. Corey', 544, 2016, false);
let persepolisRising = libraryController.addBook('Persepolis Rising', 'James. S.A. Corey', 560, 2017, false);
let tiamatsWrath = libraryController.addBook("Tiamat's Wrath", 'James. S.A. Corey', 560, 2019, false);
let leviathanFalls = libraryController.addBook('Leviathan Falls', 'James S.A. Corey', 518, 2021, false);
