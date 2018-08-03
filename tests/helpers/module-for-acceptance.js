import { module } from 'qunit';
import { resolve } from 'rsvp';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

export default function(name, options = {}) {
  module(name, {
    beforeEach: function(...args) {
      this.application = startApp();

      if (options.beforeEach) {
        return options.beforeEach.apply(this, ...args);
      }

      return undefined;
    },

    afterEach: function(...args) {
      const afterEach = options.afterEach && options.afterEach.apply(this, ...args);
      return resolve(afterEach).then(() => destroyApp(this.application));
    }
  });
}
