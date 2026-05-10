import { TYPE_POINTS } from '../const.js';
import flatpickr from 'flatpickr';
import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';

function createEditFormTemplate(point = {}, destinations = [], offers = {}){
  const {
    type = TYPE_POINTS[0],
    destination: destinationId = '',
    dateFrom = new Date(),
    dateTo = new Date(),
    basePrice = 0,
    offers: selectedOfferIds = [],
  } = point;

  const selectedDestination = destinations.find((dest) => dest.id === destinationId);
  const dateFromFormated = flatpickr.formatDate(new Date(dateFrom), 'd/m/y G:i');
  const dateToFormated = flatpickr.formatDate(new Date(dateTo), 'd/m/y G:i');

  const offersByType = Object.fromEntries(
    offers.map((item) => [item.type, item.offers])
  );
  const typeOffers = offersByType[type] || [];
  const offersTemplate = typeOffers.map((offer, index) => {
    const isChecked = selectedOfferIds.includes(offer.id);

    return `
      <div class="event__offer-selector">
        <input class="event__offer-checkbox visually-hidden"
          id="${offer.title}-${index}"
          type="checkbox"
          name="${offer.title}"
          ${isChecked ? 'checked' : ''}>
        <label class="event__offer-label" for="${offer.title}-${index}">
          <span class="event__offer-title">${offer.title}</span>
          &plus;&euro;&nbsp;
          <span class="event__offer-price">${offer.price}</span>
        </label>
      </div>
    `;
  }).join('');

  const destinationPhotosTemplate = selectedDestination.photos && selectedDestination.photos.length > 0
    ? selectedDestination.photos.map((photo) => `
          <img class="event__photo" src="${photo}" alt="Event photo">
        `).join('')
    : '';

  const destinationsTemplate = destinations.map((dest) => `
    <option value="${dest.name}"></option>
  `).join('');

  const eventTypeTemplate = TYPE_POINTS.map((eventType) =>
    `<div class="event__type-item">
                  <input id="event-type-${eventType}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${eventType}">
                  <label class="event__type-label  event__type-label--${eventType}" for="event-type-${eventType}-1">${eventType[0].toUpperCase() + eventType.slice(1)}</label>
                </div>`).join('');


  return `
            <li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type  event__type-btn" for="event-type-toggle-1">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="${type} icon">
            </label>
            <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">
            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                ${eventTypeTemplate}
              </fieldset>
            </div>
          </div>
          <div class="event__field-group  event__field-group--destination">
            <label class="event__label  event__type-output" for="event-destination-1">${type[0].toUpperCase() + type.slice(1)}</label>
            <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${selectedDestination.name}" list="destination-list-1">
            <datalist id="destination-list-1">
            ${destinationsTemplate}
            </datalist>
          </div>
          <div class="event__field-group  event__field-group--time">
            <label class="visually-hidden" for="event-start-time-1">From</label>
            <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${dateFromFormated}">
            &mdash;
            <label class="visually-hidden" for="event-end-time-1">To</label>
            <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${dateToFormated}">
          </div>
          <div class="event__field-group  event__field-group--price">
            <label class="event__label" for="event-price-1">
              <span class="visually-hidden">Price</span>
              &euro;
            </label>
            <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price" value="${basePrice}">
          </div>
          <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
          <button class="event__reset-btn" type="reset">Delete</button>
          <button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Open event</span>
          </button>
        </header>
        <section class="event__details">
          <section class="event__section  event__section--offers">
            <h3 class="event__section-title  event__section-title--offers">Offers</h3>
            <div class="event__available-offers">
              ${offersTemplate}
            </div>
          </section>
          <section class="event__section  event__section--destination">
            <h3 class="event__section-title  event__section-title--destination">Destination</h3>
            <p class="event__destination-description">${selectedDestination.description}</p>
            <div class="event__photos-container">
              <div class="event__photos-tape">
                ${destinationPhotosTemplate}
              </div>
            </div>
          </section>
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

  constructor({point, destinations, offers, onFormSubmit, onArrowClick}) {
    super();

    this.#destinations = destinations;
    this.#offers = offers;
    this.#handleArrowClick = onArrowClick;
    this.#handleFormSubmit = onFormSubmit;
    this._setState({
      ...point,
    });
    this.#setEventListeners();
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

    this.#setTypeChangeHandler();
    this.#setDestinationChangeHandler();
  }

  #setEventListeners() {
    this.element
      .querySelector('.event__rollup-btn')
      .addEventListener('click', this.#arrowClickHandler);

    this.element
      .querySelector('.event--edit')
      .addEventListener('submit',this.#formSubmitHandler);

    this.#setTypeChangeHandler();
    this.#setDestinationChangeHandler();
  }

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this.#handleFormSubmit(this._state);
  };

  #arrowClickHandler = () => {
    this.#handleArrowClick();
  };

  #setTypeChangeHandler() {
    const typeGroup = this.element.querySelector('.event__type-group');
    typeGroup.addEventListener('change', (evt) => {
      if (evt.target.name === 'event-type') {
        evt.preventDefault();
        const newType = evt.target.value;

        this.updateElement({
          type: newType,
          offers: []
        });
      }
    });
  }

  #setDestinationChangeHandler() {
    const destinationInput = this.element.querySelector('.event__input--destination');
    destinationInput.addEventListener('change', (evt) => {
      evt.preventDefault();
      const destinationId = evt.target.value;

      this.updateElement({
        destination: destinationId
      });
    });
  }
}
