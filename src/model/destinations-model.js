import Observable from '../framework/observable.js';
import { UpdateType } from '../const.js';

export default class DestinationsModel extends Observable {
  #destinations = [];
  #destinationsApiService = null;

  constructor({ destinationsApiService }) {
    super();
    this.#destinationsApiService = destinationsApiService;
  }

  get destinations() {
    return this.#destinations;
  }

  async init() {
    try {
      const destinations = await this.#destinationsApiService.destinations;
      this.#destinations = destinations;
      this._notify(UpdateType.INIT);
    } catch(err) {
      this._notify(UpdateType.ERROR); // ← ERROR, не INIT
    }
  }

  getDestinationById(id) {
    return this.#destinations.find((item) => item.id === id);
  }
}
