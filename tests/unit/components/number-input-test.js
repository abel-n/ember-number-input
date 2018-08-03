/* eslint-disable no-irregular-whitespace */

import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('number-input', "Unit | Component | number input", {
  // Specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar'],
  unit: true
});

test("numberFormatter is initialized with proper default values", function(assert) {
  const component = this.subject();
  this.render();

  const resolvedOptions = component.get('numberFormatter').resolvedOptions();
  assert.strictEqual(resolvedOptions.minimumFractionDigits, 0, "minimumFractionDigits is initialized correctly");
  assert.strictEqual(resolvedOptions.maximumFractionDigits, 10, "maximumFractionDigits is initialized correctly");
  assert.strictEqual(resolvedOptions.useGrouping, true, "useGrouping is initialized correctly");
  assert.strictEqual(resolvedOptions.locale, 'en-US', "locale is initialized correctly");
});

test("numberFormatter options are updated as necessary", function(assert) {
  const component = this.subject();
  this.render();

  component.setProperties({
    minimumFractionDigits: 5,
    maximumFractionDigits: 15,
    useGrouping: true,
    locale: 'hu',
  });
  const resolvedOptions = component.get('numberFormatter').resolvedOptions();
  assert.strictEqual(resolvedOptions.minimumFractionDigits, 5, "minimumFractionDigits is updated correctly");
  assert.strictEqual(resolvedOptions.maximumFractionDigits, 15, "maximumFractionDigits is updated correctly");
  assert.strictEqual(resolvedOptions.useGrouping, true, "useGrouping is updated correctly");
  assert.strictEqual(resolvedOptions.locale, 'hu', "locale is updated correctly");
});

test("decimalSeparator works", function(assert) {
  const component = this.subject();
  this.render();

  assert.strictEqual(component.get('decimalSeparator'), ".", "decimal separator is as in English \".\" by default");

  component.set('locale', 'hu-HU');
  assert.strictEqual(component.get('decimalSeparator'), ",", "decimal separator is as in Hungarian \",\" after setting locale");
});

test("groupSeparator works", function(assert) {
  const component = this.subject();
  this.render();

  assert.strictEqual(component.get('groupSeparator'), ",", "group separator is as in English \",\" by default");

  // irregular whitespace: " "
  component.set('locale', 'hu-HU');
  assert.strictEqual(component.get('groupSeparator'), " ", "group separator is as in Hungarian \" \" (that is a special whitespace character) after setting locale");
});

test("_toStandardized trims string correctly", function(assert) {
  const component = this.subject();
  this.render();

  const standardize1 = component.get('_toStandardized');

  assert.strictEqual(standardize1("0.0"), "0.0", '"0.0" —> "0.0"');
  assert.strictEqual(standardize1("0.00"), "0.00", '"0.00" —> "0.00"');
  assert.strictEqual(standardize1("0."), "0.", '"0." —> "0."');
  assert.strictEqual(standardize1("1.0"), "1.0", '"1.0" —> "1.0"');
  assert.strictEqual(standardize1("1.00"), "1.00", '"1.00" —> "1.00"');
  assert.strictEqual(standardize1("1.01"), "1.01", '"1.01" —> "1.01"');
  assert.strictEqual(standardize1("1,000,000.00"), "1000000.00", '"1,000,000.00" —> "1000000.00"');
  assert.strictEqual(standardize1("-0"), "-0", '"-0" —> "-0"');
  assert.strictEqual(standardize1("-0."), "-0.", '"-0." —> "-0."');
  assert.strictEqual(standardize1("-0.00"), "-0.00", '"-0.00" —> "-0.00"');
  assert.strictEqual(standardize1("-0.1"), "-0.1", '"-0.1" —> "-0.1"');

  component.set('locale', "hu");

  const standardize2 = component.get('_toStandardized');

  assert.strictEqual(standardize2("0,0"), "0.0", '"0,0" —> "0.0" (Hungarian locale)');
  assert.strictEqual(standardize2("0,00"), "0.00", '"0,00" —> "0.00" (Hungarian locale)');
  assert.strictEqual(standardize2("0,"), "0.", '"0," —> "0." (Hungarian locale)');
  assert.strictEqual(standardize2("1,0"), "1.0", '"1,0" —> "1.0" (Hungarian locale)');
  assert.strictEqual(standardize2("1,00"), "1.00", '"1,00" —> "1.00" (Hungarian locale)');
  assert.strictEqual(standardize2("1,01"), "1.01", '"1,01" —> "1.01" (Hungarian locale)');
  assert.strictEqual(standardize2("1 000 000,00"), "1000000.00", '"1 000 000,00" —> "1000000.00" (Hungarian locale)');
  assert.strictEqual(standardize2("-0"), "-0", '"-0" —> "-0" (Hungarian locale)');
  assert.strictEqual(standardize2("-0,"), "-0.", '"-0," —> "-0." (Hungarian locale)');
  assert.strictEqual(standardize2("-0,00"), "-0.00", '"-0,00" —> "-0.00" (Hungarian locale)');
  assert.strictEqual(standardize2("-0,1"), "-0.1", '"-0,1" —> "-0.1" (Hungarian locale)');
});

test("_getStandardizedCaretData", function(assert) {
  const component = this.subject();
  this.render();

  assert.deepEqual(component._getStandardizedCaretData("1,000", { start: 3, end: 3 }), { start: 2, end: 2 }, 'value: 1,000 – caret: 3');
  assert.deepEqual(component._getStandardizedCaretData("1,000", { start: 0, end: 3 }), { start: 0, end: 2 }, 'value: 1,000 – selection: 0-3');
  assert.deepEqual(component._getStandardizedCaretData("1,000", { start: 3, end: 0 }), { start: 2, end: 0 }, 'value: 1,000 – selection: 3-0');
  assert.deepEqual(component._getStandardizedCaretData("-1,000", { start: 4, end: 4 }), { start: 3, end: 3 }, 'value: -1,000 – caret: 4');
  assert.deepEqual(component._getStandardizedCaretData("-1,000.123", { start: 2, end: 9 }), { start: 2, end: 8 }, 'value: -1,000.123 – selection: 2-9');
  assert.deepEqual(component._getStandardizedCaretData("-1,000.123", { start: 9, end: 2 }), { start: 8, end: 2 }, 'value: -1,000.123 – selection: 9-2');
});

test("_calculateUpdatedData – navigation – ArrowLeft", function(assert) {
  const component = this.subject();
  this.render();

  assert.deepEqual(component._calculateUpdatedData("1000", { start: 0, end: 0 }, { key: "ArrowLeft" }).caretData, { start: 0, end: 0 });
  assert.deepEqual(component._calculateUpdatedData("1000", { start: 3, end: 3 }, { key: "ArrowLeft" }).caretData, { start: 2, end: 2 });
  assert.deepEqual(component._calculateUpdatedData("1000", { start: 4, end: 4 }, { key: "ArrowLeft" }).caretData, { start: 3, end: 3 });
  assert.deepEqual(component._calculateUpdatedData("1000", { start: 0, end: 3 }, { key: "ArrowLeft" }).caretData, { start: 0, end: 0 });
  assert.deepEqual(component._calculateUpdatedData("1000", { start: 3, end: 0 }, { key: "ArrowLeft" }).caretData, { start: 0, end: 0 });
  assert.deepEqual(component._calculateUpdatedData("1000.12", { start: 5, end: 5 }, { key: "ArrowLeft" }).caretData, { start: 4, end: 4 });
  assert.deepEqual(component._calculateUpdatedData("1000.12", { start: 6, end: 6 }, { key: "ArrowLeft" }).caretData, { start: 5, end: 5 });
  assert.deepEqual(component._calculateUpdatedData("-1000.12", { start: 1, end: 1 }, { key: "ArrowLeft" }).caretData, { start: 0, end: 0 });
});

test("_calculateUpdatedData – navigation – ArrowRight", function(assert) {
  const component = this.subject();
  this.render();

  assert.deepEqual(component._calculateUpdatedData("1000", { start: 0, end: 0 }, { key: "ArrowRight" }).caretData, { start: 1, end: 1 });
  assert.deepEqual(component._calculateUpdatedData("1000", { start: 3, end: 3 }, { key: "ArrowRight" }).caretData, { start: 4, end: 4 });
  assert.deepEqual(component._calculateUpdatedData("1000", { start: 4, end: 4 }, { key: "ArrowRight" }).caretData, { start: 4, end: 4 });
  assert.deepEqual(component._calculateUpdatedData("1000", { start: 0, end: 3 }, { key: "ArrowRight" }).caretData, { start: 3, end: 3 });
  assert.deepEqual(component._calculateUpdatedData("1000", { start: 3, end: 0 }, { key: "ArrowRight" }).caretData, { start: 3, end: 3 });
  assert.deepEqual(component._calculateUpdatedData("1000.12", { start: 4, end: 4 }, { key: "ArrowRight" }).caretData, { start: 5, end: 5 });
  assert.deepEqual(component._calculateUpdatedData("1000.12", { start: 5, end: 5 }, { key: "ArrowRight" }).caretData, { start: 6, end: 6 });
  assert.deepEqual(component._calculateUpdatedData("-1000.12", { start: 0, end: 0 }, { key: "ArrowRight" }).caretData, { start: 1, end: 1 });
});

test("_calculateUpdatedData – navigation – Ctrl + ArrowLeft", function(assert) {
  const component = this.subject();
  this.render();

  assert.deepEqual(component._calculateUpdatedData("1000", { start: 0, end: 0 }, { key: "ArrowLeft", ctrlKey: true }).caretData, { start: 0, end: 0 });
  assert.deepEqual(component._calculateUpdatedData("1000", { start: 3, end: 3 }, { key: "ArrowLeft", ctrlKey: true }).caretData, { start: 0, end: 0 });
  assert.deepEqual(component._calculateUpdatedData("1000", { start: 4, end: 4 }, { key: "ArrowLeft", ctrlKey: true }).caretData, { start: 0, end: 0 });
  assert.deepEqual(component._calculateUpdatedData("1000", { start: 0, end: 3 }, { key: "ArrowLeft", ctrlKey: true }).caretData, { start: 0, end: 0 });
  assert.deepEqual(component._calculateUpdatedData("1000", { start: 2, end: 3 }, { key: "ArrowLeft", ctrlKey: true }).caretData, { start: 0, end: 0 });
  assert.deepEqual(component._calculateUpdatedData("1000", { start: 3, end: 2 }, { key: "ArrowLeft", ctrlKey: true }).caretData, { start: 0, end: 0 });
  assert.deepEqual(component._calculateUpdatedData("1000.56124", { start: 6, end: 6 }, { key: "ArrowLeft", ctrlKey: true }).caretData, { start: 5, end: 5 });
  assert.deepEqual(component._calculateUpdatedData("1000.56124", { start: 4, end: 4 }, { key: "ArrowLeft", ctrlKey: true }).caretData, { start: 0, end: 0 });
  assert.deepEqual(component._calculateUpdatedData("-1000.56124", { start: 4, end: 4 }, { key: "ArrowLeft", ctrlKey: true }).caretData, { start: 0, end: 0 });
  assert.deepEqual(component._calculateUpdatedData("-1000.56124", { start: 6, end: 8 }, { key: "ArrowLeft", ctrlKey: true }).caretData, { start: 6, end: 6 });
  assert.deepEqual(component._calculateUpdatedData("-1000.56124", { start: 2, end: 6 }, { key: "ArrowLeft", ctrlKey: true }).caretData, { start: 5, end: 5 });
  assert.deepEqual(component._calculateUpdatedData("-1000.56124", { start: 2, end: 5 }, { key: "ArrowLeft", ctrlKey: true }).caretData, { start: 0, end: 0 });
  assert.deepEqual(component._calculateUpdatedData("-1000.56124", { start: 8, end: 6 }, { key: "ArrowLeft", ctrlKey: true }).caretData, { start: 5, end: 5 });
  assert.deepEqual(component._calculateUpdatedData("-1000.56124", { start: 8, end: 5 }, { key: "ArrowLeft", ctrlKey: true }).caretData, { start: 0, end: 0 });
});

test("_calculateUpdatedData – navigation – Ctrl + ArrowRight", function(assert) {
  const component = this.subject();
  this.render();

  assert.deepEqual(component._calculateUpdatedData("1000", { start: 0, end: 0 }, { key: "ArrowRight", ctrlKey: true }).caretData, { start: 4, end: 4 });
  assert.deepEqual(component._calculateUpdatedData("1000", { start: 3, end: 3 }, { key: "ArrowRight", ctrlKey: true }).caretData, { start: 4, end: 4 });
  assert.deepEqual(component._calculateUpdatedData("1000", { start: 4, end: 4 }, { key: "ArrowRight", ctrlKey: true }).caretData, { start: 4, end: 4 });
  assert.deepEqual(component._calculateUpdatedData("1000", { start: 0, end: 3 }, { key: "ArrowRight", ctrlKey: true }).caretData, { start: 4, end: 4 });
  assert.deepEqual(component._calculateUpdatedData("1000", { start: 2, end: 3 }, { key: "ArrowRight", ctrlKey: true }).caretData, { start: 4, end: 4 });
  assert.deepEqual(component._calculateUpdatedData("1000", { start: 3, end: 2 }, { key: "ArrowRight", ctrlKey: true }).caretData, { start: 4, end: 4 });
  assert.deepEqual(component._calculateUpdatedData("1000.56124", { start: 6, end: 6 }, { key: "ArrowRight", ctrlKey: true }).caretData, { start: 10, end: 10 });
  assert.deepEqual(component._calculateUpdatedData("1000.56124", { start: 4, end: 4 }, { key: "ArrowRight", ctrlKey: true }).caretData, { start: 5, end: 5 });
  assert.deepEqual(component._calculateUpdatedData("-1000.56124", { start: 4, end: 4 }, { key: "ArrowRight", ctrlKey: true }).caretData, { start: 5, end: 5 });
  assert.deepEqual(component._calculateUpdatedData("-1000.56124", { start: 6, end: 8 }, { key: "ArrowRight", ctrlKey: true }).caretData, { start: 11, end: 11 });
  assert.deepEqual(component._calculateUpdatedData("-1000.56124", { start: 2, end: 6 }, { key: "ArrowRight", ctrlKey: true }).caretData, { start: 11, end: 11 });
  assert.deepEqual(component._calculateUpdatedData("-1000.56124", { start: 2, end: 5 }, { key: "ArrowRight", ctrlKey: true }).caretData, { start: 6, end: 6 });
  assert.deepEqual(component._calculateUpdatedData("-1000.56124", { start: 8, end: 6 }, { key: "ArrowRight", ctrlKey: true }).caretData, { start: 11, end: 11 });
  assert.deepEqual(component._calculateUpdatedData("-1000.56124", { start: 8, end: 5 }, { key: "ArrowRight", ctrlKey: true }).caretData, { start: 6, end: 6 });
});

test("_calculateUpdatedData – navigation – Shift + ArrowLeft", function(assert) {
  const component = this.subject();
  this.render();

  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 0, end: 0 }, { key: "ArrowLeft", shiftKey: true }).caretData, { start: 0, end: 0 });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 1, end: 1 }, { key: "ArrowLeft", shiftKey: true }).caretData, { start: 1, end: 0 });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 3, end: 3 }, { key: "ArrowLeft", shiftKey: true }).caretData, { start: 3, end: 2 });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 0, end: 3 }, { key: "ArrowLeft", shiftKey: true }).caretData, { start: 0, end: 2 });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 3, end: 0 }, { key: "ArrowLeft", shiftKey: true }).caretData, { start: 3, end: 0 });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 0, end: 17 }, { key: "ArrowLeft", shiftKey: true }).caretData, { start: 0, end: 16 });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 17, end: 0 }, { key: "ArrowLeft", shiftKey: true }).caretData, { start: 17, end: 0 });
});

test("_calculateUpdatedData – navigation – Shift + ArrowRight", function(assert) {
  const component = this.subject();
  this.render();

  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 0, end: 0 }, { key: "ArrowRight", shiftKey: true }).caretData, { start: 0, end: 1 });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 1, end: 1 }, { key: "ArrowRight", shiftKey: true }).caretData, { start: 1, end: 2 });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 3, end: 3 }, { key: "ArrowRight", shiftKey: true }).caretData, { start: 3, end: 4 });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 0, end: 3 }, { key: "ArrowRight", shiftKey: true }).caretData, { start: 0, end: 4 });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 3, end: 0 }, { key: "ArrowRight", shiftKey: true }).caretData, { start: 3, end: 1 });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 0, end: 17 }, { key: "ArrowRight", shiftKey: true }).caretData, { start: 0, end: 17 });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 17, end: 0 }, { key: "ArrowRight", shiftKey: true }).caretData, { start: 17, end: 1 });
});

test("_calculateUpdatedData – navigation – Shift + Ctrl + ArrowLeft", function(assert) {
  const component = this.subject();
  this.render();

  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 0, end: 0 }, { key: "ArrowLeft", shiftKey: true, ctrlKey: true }).caretData, { start: 0, end: 0 });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 1, end: 1 }, { key: "ArrowLeft", shiftKey: true, ctrlKey: true }).caretData, { start: 1, end: 0 });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 3, end: 3 }, { key: "ArrowLeft", shiftKey: true, ctrlKey: true }).caretData, { start: 3, end: 0 });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 0, end: 3 }, { key: "ArrowLeft", shiftKey: true, ctrlKey: true }).caretData, { start: 0, end: 0 });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 3, end: 0 }, { key: "ArrowLeft", shiftKey: true, ctrlKey: true }).caretData, { start: 3, end: 0 });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 0, end: 17 }, { key: "ArrowLeft", shiftKey: true, ctrlKey: true }).caretData, { start: 0, end: 12 });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 17, end: 0 }, { key: "ArrowLeft", shiftKey: true, ctrlKey: true }).caretData, { start: 17, end: 0 });
});

test("_calculateUpdatedData – navigation – Shift + Ctrl + ArrowRight", function(assert) {
  const component = this.subject();
  this.render();

  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 0, end: 0 }, { key: "ArrowRight", shiftKey: true, ctrlKey: true }).caretData, { start: 0, end: 11 });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 1, end: 1 }, { key: "ArrowRight", shiftKey: true, ctrlKey: true }).caretData, { start: 1, end: 11 });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 3, end: 3 }, { key: "ArrowRight", shiftKey: true, ctrlKey: true }).caretData, { start: 3, end: 11 });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 0, end: 3 }, { key: "ArrowRight", shiftKey: true, ctrlKey: true }).caretData, { start: 0, end: 11 });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 3, end: 0 }, { key: "ArrowRight", shiftKey: true, ctrlKey: true }).caretData, { start: 3, end: 11 });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 0, end: 17 }, { key: "ArrowRight", shiftKey: true, ctrlKey: true }).caretData, { start: 0, end: 17 });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 17, end: 0 }, { key: "ArrowRight", shiftKey: true, ctrlKey: true }).caretData, { start: 17, end: 11 });
});

test("_calculateUpdatedData – manipulation – Delete", function(assert) {
  const component = this.subject();
  this.render();

  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 0, end: 0 }, { key: "Delete" }), { value: "1234567890.12345", caretData: { start: 0, end: 0 } });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 1, end: 1 }, { key: "Delete" }), { value: "-234567890.12345", caretData: { start: 1, end: 1 } });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 4, end: 4 }, { key: "Delete" }), { value: "-123567890.12345", caretData: { start: 4, end: 4 } });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 11, end: 11 }, { key: "Delete" }), { value: "-123456789012345", caretData: { start: 11, end: 11 } });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 15, end: 15 }, { key: "Delete" }), { value: "-1234567890.1235", caretData: { start: 15, end: 15 } });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 17, end: 17 }, { key: "Delete" }), { value: "-1234567890.12345", caretData: { start: 17, end: 17 } });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 4, end: 15 }, { key: "Delete" }), { value: "-12345", caretData: { start: 4, end: 4 } });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 14, end: 5 }, { key: "Delete" }), { value: "-1234345", caretData: { start: 5, end: 5 } });
});

test("_calculateUpdatedData – manipulation – Ctrl + Delete", function(assert) {
  const component = this.subject();
  this.render();

  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 0, end: 0 }, { key: "Delete", ctrlKey: true }), { value: ".12345", caretData: { start: 0, end: 0 } });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 1, end: 1 }, { key: "Delete", ctrlKey: true }), { value: "-.12345", caretData: { start: 1, end: 1 } });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 4, end: 4 }, { key: "Delete", ctrlKey: true }), { value: "-123.12345", caretData: { start: 4, end: 4 } });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 11, end: 11 }, { key: "Delete", ctrlKey: true }), { value: "-123456789012345", caretData: { start: 11, end: 11 } });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 15, end: 15 }, { key: "Delete", ctrlKey: true }), { value: "-1234567890.123", caretData: { start: 15, end: 15 } });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 17, end: 17 }, { key: "Delete", ctrlKey: true }), { value: "-1234567890.12345", caretData: { start: 17, end: 17 } });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 4, end: 15 }, { key: "Delete", ctrlKey: true }), { value: "4567890.123", caretData: { start: 4, end: 4 } });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 14, end: 5 }, { key: "Delete", ctrlKey: true }), { value: "567890.12", caretData: { start: 5, end: 5 } });
});

test("_calculateUpdatedData – manipulation – Backspace", function(assert) {
  const component = this.subject();
  this.render();

  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 0, end: 0 }, { key: "Backspace" }), { value: "-1234567890.12345", caretData: { start: 0, end: 0 } });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 1, end: 1 }, { key: "Backspace" }), { value: "-1234567890.12345", caretData: { start: 0, end: 0 } });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 4, end: 4 }, { key: "Backspace" }), { value: "-124567890.12345", caretData: { start: 3, end: 3 } });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 11, end: 11 }, { key: "Backspace" }), { value: "-123456789.12345", caretData: { start: 10, end: 10 } });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 12, end: 12 }, { key: "Backspace" }), { value: "-123456789012345", caretData: { start: 11, end: 11 } });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 15, end: 15 }, { key: "Backspace" }), { value: "-1234567890.1245", caretData: { start: 14, end: 14 } });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 17, end: 17 }, { key: "Backspace" }), { value: "-1234567890.1234", caretData: { start: 16, end: 16 } });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 4, end: 15 }, { key: "Backspace" }), { value: "4567890.123", caretData: { start: 4, end: 4 } });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 14, end: 5 }, { key: "Backspace" }), { value: "567890.12", caretData: { start: 5, end: 5 } });
});

test("_calculateUpdatedData – manipulation – Ctrl + Backspace", function(assert) {
  const component = this.subject();
  this.render();

  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 0, end: 0 }, { key: "Backspace", ctrlKey: true }), { value: "-1234567890.12345", caretData: { start: 0, end: 0 } });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 1, end: 1 }, { key: "Backspace", ctrlKey: true }), { value: "-1234567890.12345", caretData: { start: 0, end: 0 } });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 4, end: 4 }, { key: "Backspace", ctrlKey: true }), { value: "4567890.12345", caretData: { start: 0, end: 0 } });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 11, end: 11 }, { key: "Backspace", ctrlKey: true }), { value: ".12345", caretData: { start: 0, end: 0 } });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 12, end: 12 }, { key: "Backspace", ctrlKey: true }), { value: "-123456789012345", caretData: { start: 11, end: 11 } });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 15, end: 15 }, { key: "Backspace", ctrlKey: true }), { value: "-1234567890.45", caretData: { start: 12, end: 12 } });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 17, end: 17 }, { key: "Backspace", ctrlKey: true }), { value: "-1234567890.", caretData: { start: 12, end: 12 } });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 4, end: 15 }, { key: "Backspace", ctrlKey: true }), { value: "4567890.123", caretData: { start: 4, end: 4 } });
  assert.deepEqual(component._calculateUpdatedData("-1234567890.12345", { start: 14, end: 5 }, { key: "Backspace", ctrlKey: true }), { value: "567890.12", caretData: { start: 5, end: 5 } });
});

test("_calculateUpdatedData – manipulation – digits", function(assert) {
  const component = this.subject();
  this.render();

  assert.deepEqual(component._calculateUpdatedData("", { start: 0, end: 0 }, { key: "0" }), { value: "0", caretData: { start: 1, end: 1 } });
  assert.deepEqual(component._calculateUpdatedData("", { start: 0, end: 0 }, { key: "1" }), { value: "1", caretData: { start: 1, end: 1 } });
  assert.deepEqual(component._calculateUpdatedData("", { start: 0, end: 0 }, { key: "5" }), { value: "5", caretData: { start: 1, end: 1 } });
  assert.deepEqual(component._calculateUpdatedData("-67890.12345", { start: 1, end: 1 }, { key: "3" }), { value: "-367890.12345", caretData: { start: 2, end: 2 } });
  assert.deepEqual(component._calculateUpdatedData("-67890.12345", { start: 4, end: 4 }, { key: "3" }), { value: "-678390.12345", caretData: { start: 5, end: 5 } });
  assert.deepEqual(component._calculateUpdatedData("-67890.12345", { start: 6, end: 6 }, { key: "3" }), { value: "-678903.12345", caretData: { start: 7, end: 7 } });
  assert.deepEqual(component._calculateUpdatedData("-67890.12345", { start: 11, end: 11 }, { key: "3" }), { value: "-67890.123435", caretData: { start: 12, end: 12 } });
  assert.deepEqual(component._calculateUpdatedData("-67890.12345", { start: 12, end: 12 }, { key: "3" }), { value: "-67890.123453", caretData: { start: 13, end: 13 } });
});

test("_calculateUpdatedData – manipulation – digits", function(assert) {
  const component = this.subject();
  this.render();

  assert.deepEqual(component._calculateUpdatedData("", { start: 0, end: 0 }, { key: "-" }), { value: "-", caretData: { start: 1, end: 1 } });
  assert.deepEqual(component._calculateUpdatedData("-67890.12345", { start: 1, end: 1 }, { key: "-" }), { value: "-367890.12345", caretData: { start: 2, end: 2 } });
  assert.deepEqual(component._calculateUpdatedData("-67890.12345", { start: 4, end: 4 }, { key: "-" }), { value: "-678390.12345", caretData: { start: 5, end: 5 } });
  assert.deepEqual(component._calculateUpdatedData("-67890.12345", { start: 6, end: 6 }, { key: "-" }), { value: "-678903.12345", caretData: { start: 7, end: 7 } });
  assert.deepEqual(component._calculateUpdatedData("-67890.12345", { start: 11, end: 11 }, { key: "-" }), { value: "-67890.123435", caretData: { start: 12, end: 12 } });
  assert.deepEqual(component._calculateUpdatedData("-67890.12345", { start: 12, end: 12 }, { key: "-" }), { value: "-67890.123453", caretData: { start: 13, end: 13 } });
});

test("_calculateUpdatedData – manipulation – decimal separator", function(assert) {
  const component = this.subject();
  this.render();

  assert.deepEqual(component._calculateUpdatedData("", { start: 0, end: 0 }, { key: ",", originalData: { code: "NumpadDecimal" } }), { value: ".", caretData: { start: 1, end: 1 } }, "NumpadDecimal char is handled as a decimal separator");
  assert.deepEqual(component._calculateUpdatedData("", { start: 0, end: 0 }, { key: "." }), { value: ".", caretData: { start: 1, end: 1 } });
});
