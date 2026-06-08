import AbstractView from '../framework/view/abstract-view.js';

const ERROR_MESSAGE = 'Failed to load latest route information';

function createErrorTemplate() {
  return `<p class="trip-events__msg">${ERROR_MESSAGE}</p>`;
}

export default class ErrorView extends AbstractView {
  get template() {
    return createErrorTemplate();
  }
}
