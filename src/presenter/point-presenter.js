import PointView from '../view/point-view.js';
import EditFormView from '../view/edit-form-view.js';
import { render, replace, remove } from '../framework/render.js';
import { UserAction, UpdateType } from '../const.js';

const Mode = {
  DEFAULT: 'DEFAULT',
  EDITING: 'EDITING',
};

export default class PointPresenter {
  #container = null;

  #pointComponent = null;
  #pointEditComponent = null;

  #point = null;

  #destinationsModel = null;
  #offersModel = null;

  #handleDataChange = null;
  #handleModeChange = null;

  #mode = Mode.DEFAULT;

  constructor({ container, destinationsModel, offersModel, onDataChange, onModeChange }) {
    this.#container = container;
    this.#destinationsModel = destinationsModel;
    this.#offersModel = offersModel;
    this.#handleDataChange = onDataChange;
    this.#handleModeChange = onModeChange;
  }

  init(point) {
    this.#point = point;

    const destinations = this.#destinationsModel.destinations;
    if (!destinations || destinations.length === 0) {
      setTimeout(() => this.init(point), 100);
      return;
    }

    const prevPointComponent = this.#pointComponent;
    const prevPointEditComponent = this.#pointEditComponent;

    this.#pointComponent = new PointView({
      point,
      destination: this.#destinationsModel.getDestinationById(point.destination),
      typeOffers: this.#offersModel.getOffersByType(point.type),
      onFavoriteClick: this.#handleFavoriteClick,
      onArrowClick: this.#handleEditClick
    });

    this.#pointEditComponent = new EditFormView({
      point,
      destinations: this.#destinationsModel.destinations,
      offers: this.#offersModel.offers,
      onFormSubmit: this.#handleFormSubmit,
      onArrowClick: this.#replaceFormToCard,
      onDeleteClick: this.#handleDeleteClick
    });

    if (prevPointComponent === null || prevPointEditComponent === null) {
      render(this.#pointComponent, this.#container);
      return;
    }

    if (this.#mode === Mode.DEFAULT) {
      replace(this.#pointComponent, prevPointComponent);
    }

    if (this.#mode === Mode.EDITING) {
      replace(this.#pointEditComponent, prevPointEditComponent);
      this.#mode = Mode.DEFAULT;
    }

    remove(prevPointComponent);
    remove(prevPointEditComponent);
  }

  resetView() {
    if (this.#mode === Mode.EDITING) {
      this.#replaceFormToCard();
    }
  }

  destroy() {
    remove(this.#pointComponent);
    remove(this.#pointEditComponent);
  }

  setSaving() {
    if (this.#mode === Mode.EDITING) {
      this.#pointEditComponent.updateElement({
        isDisabled: true,
        isSaving: true,
      });
    }
  }

  setDeleting() {
    if (this.#mode === Mode.EDITING) {
      this.#pointEditComponent.updateElement({
        isDisabled: true,
        isDeleting: true,
      });
    }
  }

  setAborting() {
    if (this.#mode === Mode.DEFAULT) {
      this.#pointComponent.shake();
      return;
    }

    const resetFormState = () => {
      this.#pointEditComponent.updateElement({
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
      });
    };

    this.#pointEditComponent.shake(resetFormState);
  }

  #handleFavoriteClick = () => {
    this.#handleDataChange(
      UserAction.UPDATE_POINT, UpdateType.PATCH, {
        ...this.#point,
        isFavorite: !this.#point.isFavorite,
      });
  };

  #handleFormSubmit = (point) => {
    this.#handleDataChange(
      UserAction.UPDATE_POINT,
      UpdateType.MINOR,
      point,
    );
  };


  #replaceFormToCard = () => {
    this.#pointEditComponent.reset(this.#point);
    replace(this.#pointComponent, this.#pointEditComponent);
    document.removeEventListener('keydown', this.#escKeyDownHandler);
    this.#mode = Mode.DEFAULT;
  };

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this.#replaceFormToCard();
    }
  };

  #replaceCardToForm = () =>{
    replace(this.#pointEditComponent, this.#pointComponent);
    document.addEventListener('keydown', this.#escKeyDownHandler);
    this.#handleModeChange(this);
    this.#mode = Mode.EDITING;
  };

  #handleEditClick = () => {
    this.#replaceCardToForm();
  };

  #handleDeleteClick = () => {
    this.#handleDataChange(
      UserAction.DELETE_POINT,
      UpdateType.MINOR,
      this.#point,
    );
  };

}
