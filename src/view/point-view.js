import {
  calculateDuration,
} from '../utils/tasks.js';
import AbstractView from '../framework/view/abstract-view.js';
import flatpickr from 'flatpickr';
import he from 'he';


function createNewPointTemplate(point, destination, typeOffers) {
  if (!point) {
    return '<li class="trip-events__item">Error loading point</li>';
  }

  const {
    type = 'taxi',
    dateFrom = new Date(),
    dateTo = new Date(),
    basePrice = 0,
    offers: selectedOfferIds = [],
    isFavorite = false
  } = point;

  const fromDate = new Date(dateFrom);
  const toDate = new Date(dateTo);

  const timeDuration = calculateDuration(fromDate, toDate);
  const dateFromFormated = flatpickr.formatDate(fromDate, 'M d');
  const timeFromFormated = flatpickr.formatDate(fromDate, 'H:i');
  const timeToFormated = flatpickr.formatDate(toDate, 'H:i');

  const selectedOffers = (typeOffers || []).filter((offer) => selectedOfferIds.includes(offer.id));
  const offersTemplate = selectedOffers.length > 0 ? `
    <h4 class="visually-hidden">Offers:</h4>
    <ul class="event__selected-offers">
      ${selectedOffers.map((offer) => `
        <li class="event__offer">
          <span class="event__offer-title">${he.encode(offer.title)}</span>
          &plus;&euro;&nbsp;
          <span class="event__offer-price">${offer.price}</span>
        </li>
      `).join('')}
    </ul>
  ` : '';

  const favoriteClass = isFavorite ? 'event__favorite-btn--active' : '';

  return `
          <li class="trip-events__item">
            <div class="event">
              <time class="event__date" datetime="${fromDate.toISOString().split('T')[0]}">${dateFromFormated}</time>
              <div class="event__type">
                <img class="event__type-icon" width="42" height="42" src="img/icons/${type}.png" alt="Event type icon">
              </div>
              <h3 class="event__title">${type ? type[0].toUpperCase() + type.slice(1) : ''} ${destination?.name || ''}</h3>
              <div class="event__schedule">
                <p class="event__time">
                  <time class="event__start-time" datetime="${fromDate.toISOString()}">${timeFromFormated }</time>
                  &mdash;
                  <time class="event__end-time" datetime="${toDate.toISOString()}">${timeToFormated}</time>
                </p>
                <p class="event__duration">${timeDuration}</p>
              </div>
              <p class="event__price">
                &euro;&nbsp;<span class="event__price-value">${basePrice}</span>
              </p>
              ${offersTemplate}
              <button class="event__favorite-btn ${favoriteClass}" type="button">
                <span class="visually-hidden">Add to favorite</span>
                <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
                  <path d="M14 21l-8.22899 4.3262 1.57159-9.1631L.685209 9.67376 9.8855 8.33688 14 0l4.1145 8.33688 9.2003 1.33688-6.6574 6.48934 1.5716 9.1631L14 21z"/>
                </svg>
              </button>
              <button class="event__rollup-btn" type="button">
                <span class="visually-hidden">Open event</span>
              </button>
            </div>
          </li>
  `;
}

export default class PointView extends AbstractView {
  #point = null;
  #destination = null;
  #typeOffers = null;
  #handleArrowClick = null;
  #handleFavoriteClick = null;

  constructor({point, destination, typeOffers, onFavoriteClick, onArrowClick}) {
    super();

    this.#point = point;
    this.#destination = destination;
    this.#typeOffers = typeOffers;
    this.#handleArrowClick = onArrowClick;
    this.#handleFavoriteClick = onFavoriteClick;
    this.#setEventListener();

  }

  get template() {
    return createNewPointTemplate(
      this.#point,
      this.#destination,
      this.#typeOffers
    );
  }

  #setEventListener() {
    this.element
      .querySelector('.event__rollup-btn')
      .addEventListener('click', this.#arrowHandler);
    this.element
      .querySelector('.event__favorite-btn')
      .addEventListener('click', this.#favoriteClickHandler);
  }

  #arrowHandler = (evt) => {
    evt.preventDefault();
    this.#handleArrowClick();
  };

  #favoriteClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleFavoriteClick();
  };

  setArrowClickHandler(callback) {
    this.element
      .querySelector('.event__rollup-btn')
      .addEventListener('click', (evt) => {
        evt.preventDefault();
        callback();
      });
  }
}
