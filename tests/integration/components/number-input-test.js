import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import {
  // click,
  fillIn,
  find,
  // findAll,
  // keyEvent,
  // triggerEvent,
} from 'ember-native-dom-helpers';
import { fillInOneByOne } from '../../helpers/fill-in-one-by-one';

moduleForComponent('number-input', "Integration | Component | number input", {
  integration: true
});
//
// test("value is bound", function(assert) {
//
//   this.render(hbs`{{number-input referenceValue=value}}`);
//   const input = find('input');
//
//   this.set('value', 0);
//   assert.equal(input.value, "0");
//
//   this.set('value', 1);
//   assert.equal(input.value, "1");
// });
//
//
// test("it shows nothing if referenceValue is null or undefined", function(assert) {
//   this.render(hbs`{{number-input referenceValue=value}}`);
//   const input = find('input');
//
//   this.set('value', null);
//   assert.equal(input.value, "", "shows nothing for null");
//
//   this.set('value', undefined);
//   assert.equal(input.value, "", "shows nothing for undefined");
// });
//
// test("it shows nothing if referenceValue is text or NaN", function(assert) {
//   this.render(hbs`{{number-input referenceValue=value}}`);
//   const input = find('input');
//
//   this.set('value', "abc");
//   assert.equal(input.value, "", "shows nothing for \"abc\"");
//
//   this.set('value', NaN);
//   assert.equal(input.value, "", "shows nothing for NaN");
//
//   this.set('value', " ");
//   assert.equal(input.value, "", "shows nothing for \" \" (space)");
// });
//
// test("referenceValue is null if input is modified and then content deleted", async function(assert) {
//   this.render(hbs`{{number-input referenceValue=value}}`);
//   const input = find('input');
//
//   await fillInOneByOne(input, "123");
//   assert.equal(this.get('value'), "123");
//
//   await fillIn(input, "");
//   assert.equal(this.get('value'), null);
// });
//
// test("group separator is inserted", async function(assert) {
//   this.render(hbs`{{number-input referenceValue=value}}`);
//   const input = find('input');
//
//   await fillInOneByOne(input, "1000");
//   eslint-disable-next-line no-irregular-whitespace
//   assert.equal(input.value, "1 000");
// });
