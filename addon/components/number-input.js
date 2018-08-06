import TextField from '@ember/component/text-field';
import {
  computed,
  observer,
} from '@ember/object';
import { on } from '@ember/object/evented';
import { getOwner } from '@ember/application';
import {
  getCaretPosition,
  setCaretPosition,
} from 'ember-number-input/utils/caret-utils';

export default TextField.extend({

  minimumFractionDigits: 0,
  maximumFractionDigits: 10,
  useGrouping: true,
  locale: 'en-US',

  numberFormatter: null,

  updateFormatter: on('didReceiveAttrs', observer('locale', 'useGrouping', 'minimumFractionDigits', 'maximumFractionDigits', function() {
    const options = this.getProperties([
      'locale',
      'useGrouping',
      'minimumFractionDigits',
      'maximumFractionDigits',
    ]);
    this.set('numberFormatter', new Intl.NumberFormat(options.locale, options));
  })),

  decimalSeparator: computed('numberFormatter', function() {
    return this.get('numberFormatter').format(0.1).replace(/0|1/g, "");
  }),

  groupSeparator: computed('numberFormatter', function() {
    return this.get('numberFormatter').format(10000).replace(/0|1/g, "");
  }),

  realValue: null,
  realCaretPosition: null,
  realCaretSelection: null,

  referenceValueObserver: observer('referenceValue', function() {
    const referenceValue = this._toUngrouped(this.get('referenceValue'));
    if (referenceValue !== this.get('realValue')) {
      this.set('realValue', referenceValue);
      const groupedRefValue = this._toGrouped(referenceValue);
      if (this.get('value') !== groupedRefValue) {
        this.set('value', groupedRefValue);
      }
      this.set('referenceValue', groupedRefValue === "" ? null : this._toUngrouped(groupedRefValue));
    }
  }),

  _toGrouped: function(referenceValue) {
    const referenceValueType = typeof referenceValue;

    if (referenceValueType === 'number' && Number.isFinite(referenceValue)) {
      return this.get('numberFormatter').format(referenceValue);
    } else if (referenceValueType === 'string' && referenceValue.search(/\d/g) > -1) {
      return this.get('numberFormatter').format(this._toUngrouped(referenceValue));
    }

    return "";
  },

  _toUngrouped: function(string) {
    const decimalSeparator = this.get('decimalSeparator');
    let decimalSeparatorInRegExp = decimalSeparator;
    if ([".", ""].includes(decimalSeparator)) {
      decimalSeparatorInRegExp = "";
    } else if (decimalSeparator === "|") {
      decimalSeparatorInRegExp = "\\|";
    }
    // filter out every character that is not minus sign,
    // number or decimal character
    // (with period being an all-time default for the sake of pasting data)
    const filteredValue = String(string).replace(new RegExp(`[^\\d|.|-${decimalSeparatorInRegExp}]`, 'g'), '');
    const strippedValue = filteredValue.split(new RegExp(`\\.${decimalSeparatorInRegExp}`, 'g')).reduce((pv, nx, index) => (index === 1 ? pv + "." + nx : pv + nx), "");
    return Number(strippedValue);
  },

  keyDown: function(e) {
    // keys that don't need intervention
    if (this._shouldntPreventDefault(e)) {
      return true;
    }

    // everything else is handled manually
    e.preventDefault();

    const value = this.get('value');
    const standardizedValue = this.get('_toStandardized')(value);
    const standardizedCaretData = this._getStandardizedCaretData(value, getCaretPosition(this.element));
    const updatedData = this._calculateUpdatedData(standardizedValue, standardizedCaretData, e);

    this._updateValue(updatedData);

    return false;
  },

  _shouldntPreventDefault: function(e) {
    const {
      key,
      ctrlKey,
    } = e;
    return ["Tab", "Home", "End", "F5"].includes(key) || (ctrlKey && !key.includes("Arrow"));
  },

  _toStandardized: computed('decimalSeparator', function() {
    const decimalSeparator = this.get('decimalSeparator');
    return function(stringValue) {
      return stringValue.split("").reduce((pv, nx) => {
        if (nx === decimalSeparator) {
          return pv + ".";
        } else if ("-0123456789".includes(nx)) {
          return pv + nx;
        }
        return pv;
      }, "");
    };
  }),

  _getStandardizedCaretData: function(value, { start, end }) {
    const standardize = this.get('_toStandardized');
    return {
      start: standardize(value.substr(0, start)).length,
      end: standardize(value.substr(0, end)).length,
    };
  },

  _calculateUpdatedData: function(
    standardizedValue,
    standardizedCaretData,
    {
      key,
      shiftKey,
      ctrlKey,
      metaKey,
      originalEvent
    }
  ) {
    const originalCode = originalEvent && originalEvent.code;
    console.group('update data');
    console.log('standardizedValue', standardizedValue);
    console.log('standardizedCaretData', standardizedCaretData);
    console.log('key', key);
    console.log('shiftKey', shiftKey);
    console.log('ctrlKey', ctrlKey);
    console.log('metaKey', metaKey);
    console.log('originalCode', originalCode);
    console.groupEnd('update data');

    if (["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(key)) {
      const { start, end } = standardizedCaretData;
      return {
        value: standardizedValue.substr(0, start) + key + standardizedValue.substr(start),
        caretData: {
          start: start + 1,
          end: end + 1
        }
      };
    }

    // navigate left
    if (key === "ArrowLeft" && ctrlKey === true && shiftKey === true) {
      const { start, end } = standardizedCaretData;
      const indexOfDecimalSeparator = standardizedValue.toString().indexOf(this.get('decimalSeparator'));
      let newCaretEndIndex = 0;
      if (indexOfDecimalSeparator > 0) {
        if (end > indexOfDecimalSeparator + 1) {
          newCaretEndIndex = indexOfDecimalSeparator + 1;
        } else if (end === indexOfDecimalSeparator + 1) {
          newCaretEndIndex = indexOfDecimalSeparator;
        }
      }
      return {
        value: standardizedValue,
        caretData: {
          start: start,
          end: newCaretEndIndex
        }
      };
    }

    if (key === "ArrowLeft" && shiftKey === true) {
      const { start, end } = standardizedCaretData;
      let newCaretEndIndex = end;
      if (end) {
        newCaretEndIndex -= 1;
      }
      return {
        value: standardizedValue,
        caretData: {
          start: start,
          end: newCaretEndIndex
        }
      };
    }

    if (key === "ArrowLeft" && ctrlKey === true) {
      const { start, end } = standardizedCaretData;
      const indexOfDecimalSeparator = standardizedValue.toString().indexOf(this.get('decimalSeparator'));
      let newCaretIndex = 0;
      if (indexOfDecimalSeparator > 0) {
        if (end > indexOfDecimalSeparator + 1) {
          newCaretIndex = indexOfDecimalSeparator + 1;
        } else if (end === indexOfDecimalSeparator + 1) {
          newCaretIndex = indexOfDecimalSeparator;
        }
      }
      return {
        value: standardizedValue,
        caretData: {
          start: newCaretIndex,
          end: newCaretIndex
        }
      };
    }

    if (key === "ArrowLeft") {
      const { start, end } = standardizedCaretData;
      const minOfStartAndEnd = Math.min(start, end);
      let newCaretIndex = minOfStartAndEnd;
      if (start === end && minOfStartAndEnd) {
        newCaretIndex -= 1;
      }
      return {
        value: standardizedValue,
        caretData: {
          start: newCaretIndex,
          end: newCaretIndex
        }
      };
    }

    // navigate right
    if (key === "ArrowRight" && ctrlKey === true && shiftKey === true) {
      const { start, end } = standardizedCaretData;
      const indexOfDecimalSeparator = standardizedValue.toString().indexOf(this.get('decimalSeparator'));
      let newCaretEndIndex = standardizedValue.length;
      if (indexOfDecimalSeparator > 0) {
        if (end < indexOfDecimalSeparator) {
          newCaretEndIndex = indexOfDecimalSeparator;
        } else if (end === indexOfDecimalSeparator) {
          newCaretEndIndex = indexOfDecimalSeparator + 1;
        }
      }
      return {
        value: standardizedValue,
        caretData: {
          start: start,
          end: newCaretEndIndex
        }
      };
    }

    if (key === "ArrowRight" && shiftKey === true) {
      const { start, end } = standardizedCaretData;
      let newCaretEndIndex = end;
      if (end < standardizedValue.length) {
        newCaretEndIndex += 1;
      }
      return {
        value: standardizedValue,
        caretData: {
          start: start,
          end: newCaretEndIndex
        }
      };
    }

    if (key === "ArrowRight" && ctrlKey === true) {
      const { start, end } = standardizedCaretData;
      const indexOfDecimalSeparator = standardizedValue.toString().indexOf(this.get('decimalSeparator'));
      let newCaretIndex = standardizedValue.length;
      if (indexOfDecimalSeparator > 0) {
        if (end < indexOfDecimalSeparator) {
          newCaretIndex = indexOfDecimalSeparator;
        } else if (end === indexOfDecimalSeparator) {
          newCaretIndex = indexOfDecimalSeparator + 1;
        }
      }
      return {
        value: standardizedValue,
        caretData: {
          start: newCaretIndex,
          end: newCaretIndex
        }
      };
    }

    if (key === "ArrowRight") {
      const { start, end } = standardizedCaretData;
      const maxOfStartAndEnd = Math.max(start, end);
      const navigateRightCondition = maxOfStartAndEnd < standardizedValue.length;
      let newCaretIndex = maxOfStartAndEnd;
      if (start === end && navigateRightCondition) {
        newCaretIndex += 1;
      }
      return {
        value: standardizedValue,
        caretData: {
          start: newCaretIndex,
          end: newCaretIndex
        }
      };
    }

    // backspace
    if (key === "Backspace" && ctrlKey === true) {
      const { start, end } = standardizedCaretData;
      const minOfStartAndEnd = Math.min(start, end);
      const maxOfStartAndEnd = Math.max(start, end);
      const indexOfDecimalSeparator = standardizedValue.toString().indexOf(this.get('decimalSeparator'));
      let newValue = standardizedValue.substr(start);
      if (indexOfDecimalSeparator < start) {
        newValue = standardizedValue.substr(0, indexOfDecimalSeparator + 1) + standardizedValue.substr(start);
      }
      if (start !== end) {
        newValue = standardizedValue.substr(0, minOfStartAndEnd) + standardizedValue.substr(maxOfStartAndEnd);
      }
      if (indexOfDecimalSeparator + 1 === start) {
        newValue = standardizedValue.substr(0, indexOfDecimalSeparator) + standardizedValue.substr(start);
      }
      const subtractedValue = standardizedValue.length - newValue.length;
      return {
        value: newValue,
        caretData: {
          start: maxOfStartAndEnd - subtractedValue,
          end: maxOfStartAndEnd - subtractedValue
        }
      };
    }

    if (key === "Backspace") {
      const { start, end } = standardizedCaretData;
      const minOfStartAndEnd = Math.min(start, end);
      const maxOfStartAndEnd = Math.max(start, end);
      let newValue = standardizedValue.substr(0, start ? start - 1 : 0) + standardizedValue.substr(start);
      if (start !== end) {
        newValue = standardizedValue.substr(0, minOfStartAndEnd) + standardizedValue.substr(maxOfStartAndEnd);
      }
      const subtractedValue = standardizedValue.length - newValue.length;
      return {
        value: newValue,
        caretData: {
          start: maxOfStartAndEnd - subtractedValue,
          end: maxOfStartAndEnd - subtractedValue
        }
      };
    }

    // delete
    if (key === "Delete" && ctrlKey === true) {
      const { start, end } = standardizedCaretData;
      const minOfStartAndEnd = Math.min(start, end);
      const maxOfStartAndEnd = Math.max(start, end);
      const indexOfDecimalSeparator = standardizedValue.toString().indexOf(this.get('decimalSeparator'));
      let newValue = standardizedValue.substr(0, start);
      if (indexOfDecimalSeparator > start) {
        newValue = standardizedValue.substr(0, start) + standardizedValue.substr(indexOfDecimalSeparator);
      }
      if (start !== end) {
        newValue = standardizedValue.substr(0, minOfStartAndEnd) + standardizedValue.substr(maxOfStartAndEnd);
      }
      if (indexOfDecimalSeparator === start) {
        newValue = standardizedValue.substr(0, end) + standardizedValue.substr(end + 1);
      }
      return {
        value: newValue,
        caretData: {
          start: minOfStartAndEnd,
          end: minOfStartAndEnd
        }
      };
    }

    if (key === "Delete") {
      const { start, end } = standardizedCaretData;
      const minOfStartAndEnd = Math.min(start, end);
      const maxOfStartAndEnd = Math.max(start, end);
      let newValue = standardizedValue.substr(0, end) + standardizedValue.substr(end + 1);
      if (start !== end) {
        newValue = standardizedValue.substr(0, minOfStartAndEnd) + standardizedValue.substr(maxOfStartAndEnd);
      }
      return {
        value: newValue,
        caretData: {
          start: minOfStartAndEnd,
          end: minOfStartAndEnd
        }
      };
    }

    // toggle sign
    if (key === "-") {
      const { start, end } = standardizedCaretData;

      const isFullSelection = Math.abs(end - start) === standardizedValue.length;
      if (isFullSelection || !standardizedValue.length) {
        return { value: "-", caretData: { start: 1, end: 1 } };
      }

      const isNegative = standardizedValue[0] === "-";
      if (isNegative) {
        return {
          value: standardizedValue.substr(1),
          caretData: {
            start: start - 1,
            end: end - 1
          }
        };
      }

      return {
        value: "-" + standardizedValue,
        caretData: {
          start: start + 1,
          end: end + 1
        }
      };
    }

    // default: no change
    return {
      value: standardizedValue,
      caretData: standardizedCaretData,
    };
  },

  _updateValue: function({ value, caretData }) {
    if (["", "-", ".", "-."].includes(value)) {
      this.element.value = value.replace(".", this.get('decimalSeparator'));
    } else {
      this.element.value = this.get('numberFormatter').format(value);
    }
    setCaretPosition(this.element, caretData);
  },

  change: function(e) {
    const config = getOwner(this).resolveRegistration('config:environment');
    if (config && config.environment === 'test') {
      this.set('value', this.element.value);
    }
  },

});
