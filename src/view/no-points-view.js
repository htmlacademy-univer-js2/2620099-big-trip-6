import AbstractView from '../framework/view/abstract-view.js';
import { FilterType } from '../const.js';

const NoTasksTextType = {
  [FilterType.EVERYTHING]: 'Click New Event to create your first point',
  [FilterType.FUTURE]: 'There are no future events now',
  [FilterType.PRESENT]: 'There are no present events now',
  [FilterType.PAST]: 'TThere are no past events now',
};


function createNoPointsTemplate(filterType) {
  const noTaskTextValue = NoTasksTextType[filterType];

  return `
    <section class="trip-events">
      <h2 class="visually-hidden">Trip events</h2>
      <p class="trip-events__msg">${noTaskTextValue}</p>
    </section>
  `;
}

export default class NoPointsView extends AbstractView {
  #filterType = null;

  constructor({filterType}) {
    super();
    this.#filterType = filterType;
  }

  get template() {
    return createNoPointsTemplate(this.#filterType);
  }
}
