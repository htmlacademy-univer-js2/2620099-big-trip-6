import TripPresenter from './presenter/trip-presenter.js';
import PointsModel from './model/points-model.js';
import OffersModel from './model/offers-model.js';
import FilterModel from './model/filter-model.js';
import DestinationsModel from './model/destinations-model.js';
import FilterPresenter from './presenter/filter-presenter.js';
import TripInfoPresenter from './presenter/trip-info-presenter.js';
import PointsApiService from './points-api-service.js';
import OffersApiService from './offers-api-service.js';
import DestinationsApiService from './destinations-api-service.js';

const AUTHORIZATION = 'Basic eo0w590iu29889t';
const END_POINT = 'https://24.objects.htmlacademy.pro/big-trip';

const siteMainElement = document.querySelector('.trip-main');
const newEventButton = siteMainElement.querySelector('.trip-main__event-add-btn');

const pointsModel = new PointsModel({
  pointsApiService: new PointsApiService(END_POINT, AUTHORIZATION)
});

const offersModel = new OffersModel({
  offersApiService: new OffersApiService(END_POINT, AUTHORIZATION)
});

const destinationsModel = new DestinationsModel({
  destinationsApiService: new DestinationsApiService(END_POINT, AUTHORIZATION)
});

const filterModel = new FilterModel();

const tripInfoPresenter = new TripInfoPresenter({
  container: siteMainElement,
  pointsModel,
  destinationsModel,
  offersModel
});

const tripPresenter = new TripPresenter({
  tripContainer:siteMainElement,
  pointsModel,
  offersModel,
  destinationsModel,
  filterModel,
  onNewPointDestroy: handleNewPointFormClose
});

const filterPresenter = new FilterPresenter({
  filterContainer: siteMainElement,
  filterModel,
  pointsModel
});


function handleNewPointFormClose() {
  newEventButton.disabled = false;
}

newEventButton.addEventListener('click', handleNewPointButtonClick);

newEventButton.disabled = true;


function handleNewPointButtonClick() {
  tripPresenter.createPoint();
  newEventButton.disabled = true;
}

filterPresenter.init();
tripInfoPresenter.init();
tripPresenter.init();
Promise.all([
  pointsModel.init(),
  offersModel.init(),
  destinationsModel.init(),
]).then(() => {
  tripInfoPresenter.init();
}).finally(() => {
  newEventButton.disabled = false;
});
