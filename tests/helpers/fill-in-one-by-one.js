import { registerAsyncHelper } from '@ember/test';
import {
  triggerEvent,
  fillIn,
} from 'ember-native-dom-helpers';
// import $ from 'jquery';

const awaitAndThen = (fns) => {
  const awaitFn = fns[0];
  const thenFns = fns.slice(1);

  if (awaitFn.then) {
    return awaitFn.then(() => {
      if (thenFns.length) {
        return awaitAndThen(thenFns);
      }
      return null;
    });
  }

  awaitFn();
  if (thenFns.length) {
    return awaitAndThen(thenFns);
  }
  return null;
};

export function fillInOneByOne(obj, str) {
  return awaitAndThen(str.split('').map(letter => [
    triggerEvent(obj, 'keydown', {
      key: letter,
    }),
    triggerEvent(obj, 'keypress', {
      key: letter,
    }),
    triggerEvent(obj, 'keyup', {
      key: letter,
    }),
    fillIn(obj, `${obj.value}${letter}`),
  ]).reduce((pv, nx) => pv.concat(nx), []));
}

export default registerAsyncHelper('fillInOneByOne', function(app, assert, obj, str) {
  return fillInOneByOne(obj, str);
});
