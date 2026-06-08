import {
} from '../const';
import dayjs from 'dayjs';

const calculateDuration = (dateFrom, dateTo) => {
  if (!dateFrom || !dateTo) {
    return '00H 00M';
  }

  const durationInMinutes = Math.floor((dateTo - dateFrom) / (1000 * 60));

  const days = Math.floor(durationInMinutes / 1440);
  const hours = Math.floor((durationInMinutes % 1440) / 60);
  const minutes = durationInMinutes % 60;

  const format = (value) => String(value).padStart(2, '0');

  if (days > 0) {
    return `${format(days)}D ${format(hours)}H ${format(minutes)}M`;
  }

  return `${format(hours)}H ${format(minutes)}M`;
};


const formatTime = (date) => date.toTimeString().slice(0, 5);


const formatDateTime = (date) => date.toISOString().slice(0, 16);

function isFuturePoint(dueDate) {
  return dueDate && dayjs().isBefore(dueDate, 'D');
}

function isPastPoint(dueDate) {
  return dueDate && dayjs().isAfter(dueDate, 'D');
}

function isPresentPoint(dateFrom, dateTo) {
  const now = dayjs();
  const start = dayjs(dateFrom);
  const end = dayjs(dateTo);

  return start <= now && end >= now;
}

export {
  formatTime,
  formatDateTime,
  calculateDuration,
  isFuturePoint,
  isPastPoint,
  isPresentPoint
};
