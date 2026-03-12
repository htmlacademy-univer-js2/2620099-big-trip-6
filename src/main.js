import TripPresenter from './presenter/trip-presenter.js';

const siteMainElement = document.querySelector('.trip-main');
const tripPresenter = new TripPresenter({tripContainer:siteMainElement});

tripPresenter.init();
