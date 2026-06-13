import { FilterType } from '../const.js';
import { isFuturePoint, isPastPoint, isPresentPoint } from './date.js';

const filter = {
  [FilterType.EVERYTHING]: (points) => points,

  [FilterType.FUTURE]: (points) =>
    points.filter((point) => isFuturePoint(point.dateFrom)),

  [FilterType.PAST]: (points) =>
    points.filter((point) => isPastPoint(point.dateTo)),

  [FilterType.PRESENT]: (points) =>
    points.filter((point) =>
      isPresentPoint(point.dateFrom, point.dateTo)
    ),
};

export {filter};
