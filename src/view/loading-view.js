import AbstractView from '../framework/view/abstract-view.js';

const LOADING_MESSAGE = 'Loading...';

function createLoadingTemplate() {
  return `<p class="trip-events__msg">${LOADING_MESSAGE}</p>`;
}

export default class LoadingView extends AbstractView {
  get template() {
    return createLoadingTemplate();
  }
}
