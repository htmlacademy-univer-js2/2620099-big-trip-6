import { render, remove, replace } from '../framework/render.js';
import TripInfoView from '../view/trip-info-view.js';

function formatDateRange(dateFrom, dateTo) {
  if (!dateFrom || !dateTo) {
    return '';
  }

  const start = new Date(dateFrom);
  const end = new Date(dateTo);

  const startMonth = start.toLocaleString('en', { month: 'short' });
  const startDay = start.getDate();
  const endMonth = end.toLocaleString('en', { month: 'short' });
  const endDay = end.getDate();
  const endYear = end.getFullYear();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}&nbsp;&mdash;&nbsp;${endDay}`;
  }

  return `${startMonth} ${startDay}&nbsp;&mdash;&nbsp;${endMonth} ${endDay}, ${endYear}`;
}

function formatRoute(destinations) {
  if (!destinations.length) {
    return '';
  }

  if (destinations.length === 1) {
    return destinations[0];
  }

  if (destinations.length === 2) {
    return `${destinations[0]} &mdash; ${destinations[1]}`;
  }

  return `${destinations[0]} &mdash; ... &mdash; ${destinations[destinations.length - 1]}`;
}

export default class TripInfoPresenter {
  #container = null;
  #pointsModel = null;
  #destinationsModel = null;
  #offersModel = null;

  #tripInfoComponent = null;

  constructor({ container, pointsModel, destinationsModel, offersModel }) {
    this.#container = container;
    this.#pointsModel = pointsModel;
    this.#destinationsModel = destinationsModel;
    this.#offersModel = offersModel;

    this.#pointsModel.addObserver(this.#handleModelEvent);
    this.#destinationsModel.addObserver(this.#handleModelEvent);
    this.#offersModel.addObserver(this.#handleModelEvent);
  }

  get #points() {
    return this.#pointsModel.points;
  }

  get #destinations() {
    const destinationNames = [];
    const seenIds = new Set();

    const sortedPoints = [...this.#points].sort(
      (a, b) => new Date(a.dateFrom) - new Date(b.dateFrom)
    );

    for (const point of sortedPoints) {
      const destination = this.#destinationsModel.getDestinationById(point.destination);
      if (destination && !seenIds.has(point.destination)) {
        seenIds.add(point.destination);
        destinationNames.push(destination.name);
      }
    }

    return destinationNames;
  }

  get #dates() {
    if (!this.#points.length) {
      return { dateFrom: null, dateTo: null };
    }
    const sortedPoints = [...this.#points].sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));

    const dateFrom = sortedPoints[0]?.dateFrom || null;
    const dateTo = sortedPoints[sortedPoints.length - 1]?.dateTo || null;

    return { dateFrom, dateTo };
  }

  get #totalPrice() {
    let total = 0;

    for (const point of this.#points) {
      total += point.basePrice;

      const typeOffers = this.#offersModel.getOffersByType(point.type);
      if (typeOffers && point.offers) {
        for (const offerId of point.offers) {
          const offer = typeOffers.find((o) => o.id === offerId);
          if (offer) {
            total += offer.price;
          }
        }
      }
    }

    return total;
  }

  init() {
    const destinations = this.#destinations;
    const { dateFrom, dateTo } = this.#dates;
    const totalPrice = this.#totalPrice;

    const prevTripInfoComponent = this.#tripInfoComponent;

    if (this.#points.length === 0) {
      if (prevTripInfoComponent) {
        remove(prevTripInfoComponent);
        this.#tripInfoComponent = null;
      }
      return;
    }

    const routeTitle = formatRoute(destinations);
    const dateRange = formatDateRange(dateFrom, dateTo);

    const tripInfo = {
      title: routeTitle,
      dates: dateRange,
      cost: totalPrice
    };

    this.#tripInfoComponent = new TripInfoView({ tripInfo });

    if (prevTripInfoComponent === null) {
      render(this.#tripInfoComponent, this.#container, 'afterbegin');
      return;
    }

    replace(this.#tripInfoComponent, prevTripInfoComponent);
    remove(prevTripInfoComponent);
  }

  #handleModelEvent = () => {
    this.init();
  };
}
