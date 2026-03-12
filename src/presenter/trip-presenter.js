import FilterView from '../view/filter-view.js';
import SortView from '../view/sort-view.js';
import PointView from '../view/point-view.js';
import CreateFormView from '../view/create-form-view.js';
import EditFormView from '../view/edit-form-view.js';
import { render } from '../render.js';

const POINT_COUNT = 3;

export default class TripPresenter{
  constructor({tripContainer}){
    this.tripContainer = tripContainer;
    this.filterConteiner = document.querySelector('.trip-controls__filters');
    this.eventsConteiner = document.querySelector('.trip-events');


    this.filterComponent = new FilterView();
    this.sortComponent = new SortView();
    this.createFormComponent = new CreateFormView();
    this.editFormComponent = new EditFormView();
  }

  init(){
    render(this.filterComponent, this.filterConteiner);
    render(this.editFormComponent,this.eventsConteiner);
    render(this.createFormComponent, this.eventsConteiner);
    render(this.sortComponent, this.eventsConteiner);

    for (let i = 0; i < POINT_COUNT;i++){
      const pointComponent = new PointView();
      render(pointComponent, this.eventsConteiner);
    }

  }
}
