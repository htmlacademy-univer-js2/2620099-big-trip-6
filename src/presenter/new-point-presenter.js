import {remove, render, RenderPosition} from '../framework/render.js';
import EditFormView from '../view/edit-form-view.js';
import {UserAction, UpdateType, TYPE_POINTS} from '../const.js';

export default class NewPointPresenter {
  #destinationsModel = null;
  #offersModel = null;
  #pointListContainer = null;
  #handleDataChange = null;
  #handleDestroy = null;

  #pointEditComponent = null;

  constructor({pointListContainer, onDataChange, onDestroy, destinationsModel, offersModel}) {
    this.#pointListContainer = pointListContainer;
    this.#destinationsModel = destinationsModel;
    this.#offersModel = offersModel;
    this.#handleDataChange = onDataChange;
    this.#handleDestroy = onDestroy;
  }

  init() {
    if (this.#pointEditComponent !== null) {
      return;
    }

    const defaultPoint = {
      type: TYPE_POINTS[0],
      destination: null,
      dateFrom: null,
      dateTo: null,
      basePrice: 0,
      offers: [],
      isFavorite: false,
      isNewPoint: true,
    };

    this.#pointEditComponent = new EditFormView({
      point: defaultPoint,
      destinations: this.#destinationsModel.destinations,
      offers: this.#offersModel.offers,
      onFormSubmit: this.#handleFormSubmit,
      onDeleteClick: this.#handleDeleteClick,
      onArrowClick: this.#handleDeleteClick
    });

    render(this.#pointEditComponent, this.#pointListContainer, RenderPosition.AFTERBEGIN);

    document.addEventListener('keydown', this.#escKeyDownHandler);
  }

  destroy() {
    if (this.#pointEditComponent === null) {
      return;
    }

    this.#handleDestroy();

    remove(this.#pointEditComponent);
    this.#pointEditComponent = null;

    document.removeEventListener('keydown', this.#escKeyDownHandler);
  }

  setSaving() {
    this.#pointEditComponent.updateElement({
      isDisabled: true,
      isSaving: true,
    });
  }

  setAborting() {
    const resetFormState = () => {
      this.#pointEditComponent.updateElement({
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
      });
    };

    this.#pointEditComponent.shake(resetFormState);
  }


  #handleFormSubmit = (point) => {
    const dateFrom = point.dateFrom
      ? new Date(point.dateFrom).toISOString()
      : new Date().toISOString();

    const dateTo = point.dateTo
      ? new Date(point.dateTo).toISOString()
      : new Date().toISOString();

    this.#handleDataChange(
      UserAction.ADD_POINT,
      UpdateType.MINOR,
      {
        type: point.type || 'flight',
        destination: point.destination || '',
        offers: point.offers || [],
        basePrice: point.basePrice || 0,
        isFavorite: point.isFavorite || false,
        ...point,
        dateFrom,
        dateTo,
      }
    );

  };

  #handleDeleteClick = () => {
    this.destroy();
  };

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.destroy();
    }
  };
}
