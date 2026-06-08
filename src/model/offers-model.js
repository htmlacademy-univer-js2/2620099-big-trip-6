import Observable from '../framework/observable.js';
import { UpdateType } from '../const.js';

export default class OffersModel extends Observable {
  #offers = [];
  #offersApiService = null;

  constructor({ offersApiService }) {
    super();
    this.#offersApiService = offersApiService;
  }

  get offers() {
    return this.#offers;
  }

  async init() {
    try {
      const offers = await this.#offersApiService.offers;
      this.#offers = offers;
      this._notify(UpdateType.INIT);
    } catch(err) {
      this._notify(UpdateType.ERROR);
    }
  }

  getOffersByType(type) {
    const offers = this.#offers.find((o) => o.type === type);
    return offers ? offers.offers : [];
  }

  getOffersById(type, itemsId) {
    return this.getOffersByType(type).filter((item) => itemsId.includes(item.id));
  }
}
