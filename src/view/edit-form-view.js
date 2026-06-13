import { TYPE_POINTS } from '../const.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import he from 'he';
import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';

function createEditFormTemplate(point = {}, destinations = [], offers = []){
  const {
    type = TYPE_POINTS[0],
    destination: destinationId = '',
    dateFrom = null,
    dateTo = null,
    basePrice = 0,
    offers: selectedOfferIds = [],
    isNewPoint = false,
  } = point;

  const selectedDestination = destinations.find(
    (dest) => dest.id === destinationId
  );

  const dateFromFormated = dateFrom
    ? flatpickr.formatDate(new Date(dateFrom), 'd/m/y H:i')
    : '';

  const dateToFormated = dateTo
    ? flatpickr.formatDate(new Date(dateTo), 'd/m/y H:i')
    : '';

  const offersByType = Object.fromEntries(
    offers.map((item) => [item.type, item.offers])
  );
  const typeOffers = offersByType[type] || [];
  const offersTemplate = typeOffers.map((offer, index) => {
    const isChecked = selectedOfferIds.includes(offer.id);
    const safeTitle = he.encode(offer.title);
    const safePrice = he.encode(String(offer.price));

    return `

      <div class="event__offer-selector">
        <input class="event__offer-checkbox visually-hidden"
          id="${safeTitle}-${index}"
          type="checkbox"
          name="${safeTitle}"
          data-offer-id="${offer.id}"
          ${isChecked ? 'checked' : ''}>
        <label class="event__offer-label" for="${safeTitle}-${index}">
          <span class="event__offer-title">${safeTitle}</span>
          &plus;&euro;&nbsp;
          <span class="event__offer-price">${safePrice}</span>
        </label>
      </div>
    `;
  }).join('');

  const destinationPhotosTemplate =
    selectedDestination &&
    selectedDestination.pictures &&
    selectedDestination.pictures.length > 0
      ? selectedDestination.pictures.map((picture) => `
          <img
            class="event__photo"
            src="${he.encode(picture.src)}"
            alt="${he.encode(picture.description)}"
          >
        `).join('')
      : '';

  const destinationsTemplate = destinations.map((dest) => `
    <option value="${he.encode(dest.name)}"></option>
  `).join('');

  const eventTypeTemplate = TYPE_POINTS.map((eventType) =>
    `<div class="event__type-item">
                  <input id="event-type-${eventType}" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${eventType}">
                  <label class="event__type-label  event__type-label--${eventType}" for="event-type-${eventType}">${eventType[0].toUpperCase() + eventType.slice(1)}</label>
                </div>`).join('');

  let resetButtonText = 'Delete';

  if (point.isDeleting) {
    resetButtonText = 'Deleting...';
  } else if (isNewPoint) {
    resetButtonText = 'Cancel';
  }

  const hasDestination =
    selectedDestination?.description ||
    (selectedDestination?.pictures?.length > 0);

  const destinationSectionTemplate = hasDestination
    ? `
      <section class="event__section event__section--destination">
        <h3 class="event__section-title event__section-title--destination">Destination</h3>
        <p class="event__destination-description">
          ${selectedDestination?.description ?? ''}
        </p>

        ${ selectedDestination?.pictures?.length > 0 ? ` <div class="event__photos-container">
        <div class="event__photos-tape">
          ${destinationPhotosTemplate} </div>
      </div> ` : '' }
      </section>
    `
    : '';

  return `
            <li class="trip-events__item">
      <form class="event event--edit" action="#" method="post" autocomplete="off">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type  event__type-btn" for="event-type-toggle">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${he.encode(type)}.png" alt="${he.encode(type)} icon">
            </label>
            <input class="event__type-toggle  visually-hidden" id="event-type-toggle" type="checkbox">
            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                ${eventTypeTemplate}
              </fieldset>
            </div>
          </div>
          <div class="event__field-group  event__field-group--destination">
            <label class="event__label  event__type-output" for="event-destination">${type[0].toUpperCase() + type.slice(1)}</label>
            <input class="event__input event__input--destination" id="event-destination" type="text" name="event-destination" value="${selectedDestination ? selectedDestination.name : ''}" list="destination-list">
            <datalist id="destination-list">
            ${destinationsTemplate}
            </datalist>
          </div>
          <div class="event__field-group  event__field-group--time">
            <label class="visually-hidden" for="event-start-time">From</label>
            <input class="event__input  event__input--time" id="event-start-time" type="text" name="event-start-time" value="${dateFromFormated}">
            &mdash;
            <label class="visually-hidden" for="event-end-time">To</label>
            <input class="event__input  event__input--time" id="event-end-time" type="text" name="event-end-time" value="${dateToFormated}">
          </div>
          <div class="event__field-group  event__field-group--price">
            <label class="event__label" for="event-price">
              <span class="visually-hidden">Price</span>
              &euro;
            </label>
            <input class="event__input  event__input--price" id="event-price" type="number" name="event-price" value="${basePrice}" min="0">
          </div>
          <button class="event__save-btn btn btn--blue" type="submit" ${point.isSaving ? 'disabled' : ''}>
            ${point.isSaving ? 'Saving...' : 'Save'}
          </button>

          <button class="event__reset-btn" type="button" ${point.isDeleting ? 'disabled' : ''}>
            ${ resetButtonText }
          </button>

          <button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Open event</span>
          </button>
        </header>
        <section class="event__details">
        ${typeOffers.length > 0 ? `
          <section class="event__section event__section--offers">
            <h3 class="event__section-title event__section-title--offers">Offers</h3>
            <div class="event__available-offers">
              ${offersTemplate}
            </div>
          </section>
        ` : ''}
        ${destinationSectionTemplate}
      </section>
      </form>
    </li>
        `;
}

export default class EditFormView extends AbstractStatefulView {
  #point = null;
  #destinations = null;
  #offers = null;
  #handleFormSubmit = null;
  #handleArrowClick = null;
  #handleDeleteClick = null;
  #datepickerStart = null;
  #datepickerEnd = null;

  #originalState = null;

  constructor({point, destinations, offers, onFormSubmit, onArrowClick, onDeleteClick}) {
    super();

    this.#destinations = destinations;
    this.#offers = offers;
    this.#handleArrowClick = onArrowClick;
    this.#handleFormSubmit = onFormSubmit;
    this.#handleDeleteClick = onDeleteClick;
    this._setState({
      ...point,
      isDisabled: false,
      isSaving: false,
      isDeleting: false
    });
    this.#setEventListeners();


    this.#setDatepickerStart();
    this.#setDatepickerEnd();
  }

  get template() {
    return createEditFormTemplate(
      this._state,
      this.#destinations,
      this.#offers
    );
  }

  _restoreHandlers() {
    this.element.querySelector('.event--edit')
      .addEventListener('submit', this.#formSubmitHandler);

    this.element.querySelector('.event__rollup-btn')
      .addEventListener('click', this.#arrowClickHandler);

    this.element.querySelector('.event__reset-btn')
      .addEventListener('click', this.#deleteClickHandler);

    this.element.querySelector('.event__input--price')
      .addEventListener('change', this.#priceChangeHandler);

    this.#setTypeChangeHandler();
    this.#setDestinationChangeHandler();
    this.#setOffersChangeHandler();
    this.#setDatepickerStart();
    this.#setDatepickerEnd();
  }

  _destroyDatepickers() {
    if (this.#datepickerStart) {
      this.#datepickerStart.destroy();
      this.#datepickerStart = null;
    }

    if (this.#datepickerEnd) {
      this.#datepickerEnd.destroy();
      this.#datepickerEnd = null;
    }
  }


  _setState(partialState) {
    if (partialState.type !== undefined && partialState.basePrice === undefined) {
      partialState.basePrice = this._state.basePrice;
    }

    super._setState(partialState);
  }

  reset(point) {
    this.updateElement({
      ...point,
      isDisabled: false,
      isSaving: false,
      isDeleting: false,
    });
  }

  #setEventListeners() {
    this.element
      .querySelector('.event__rollup-btn')
      .addEventListener('click', this.#arrowClickHandler);

    this.element
      .querySelector('.event--edit')
      .addEventListener('submit',this.#formSubmitHandler);

    this.element
      .querySelector('.event__reset-btn')
      .addEventListener('click', this.#deleteClickHandler);

    this.element
      .querySelector('.event__input--price')
      .addEventListener('change', this.#priceChangeHandler);

    this.#setTypeChangeHandler();
    this.#setDestinationChangeHandler();
    this.#setOffersChangeHandler();
  }

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this.#handleFormSubmit(this._state);
  };

  #arrowClickHandler = () => {
    this.#handleArrowClick();
  };

  #deleteClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleDeleteClick();
  };

  #priceChangeHandler = (evt) => {
    this._setState({
      basePrice: Number(evt.target.value),
    });
  };

  #setTypeChangeHandler() {
    const typeGroup = this.element.querySelector('.event__type-group');
    typeGroup.addEventListener('change', (evt) => {
      if (evt.target.name === 'event-type') {
        evt.preventDefault();
        const newType = evt.target.value;
        if (!this.#originalState) {
          this.#originalState = { ...this._state };
        }

        const currentPrice = this._state.basePrice;

        this.updateElement({
          type: newType,
          basePrice: currentPrice,
          offers: [],
        });
      }
    });
  }

  #setOffersChangeHandler() {
    this.element.addEventListener('change', (evt) => {
      if (!evt.target.classList.contains('event__offer-checkbox')) {
        return;
      }

      const offerId = evt.target.dataset.offerId;
      const offers = new Set(this._state.offers);

      if (evt.target.checked) {
        offers.add(offerId);
      } else {
        offers.delete(offerId);
      }

      this._setState({
        offers: Array.from(offers),
      });
    });
  }

  #setDestinationChangeHandler() {
    const destinationInput = this.element.querySelector('.event__input--destination');
    destinationInput.addEventListener('change', (evt) => {
      evt.preventDefault();
      const destinationName = evt.target.value;

      const selectedDest = this.#destinations.find(
        (dest) => dest.name === destinationName
      );

      if (selectedDest) {
        this.updateElement({
          destination: selectedDest.id
        });
      } else {
        this.updateElement({
          destination: null
        });
      }
    });
  }

  #dateFromChangeHandler = ([userDate]) => {
    this._setState({
      dateFrom: userDate,
    });
  };

  #dateToChangeHandler = ([userDate]) => {
    this._setState({
      dateTo: userDate,
    });
  };

  #setDatepickerStart() {
    this.#datepickerStart = flatpickr(
      this.element.querySelector('#event-start-time'),
      {
        dateFormat: 'd/m/y H:i',
        enableTime: true,
        'time_24hr': true,
        defaultDate: this._state.dateFrom,
        onChange: this.#dateFromChangeHandler,
        maxDate: this._state.dateTo,
      }
    );
  }

  #setDatepickerEnd() {
    this.#datepickerEnd = flatpickr(
      this.element.querySelector('#event-end-time'),
      {
        dateFormat: 'd/m/y H:i',
        enableTime: true,
        'time_24hr': true,
        defaultDate: this._state.dateTo,
        onChange: this.#dateToChangeHandler,
        minDate: this._state.dateFrom,
      }
    );
  }
}
