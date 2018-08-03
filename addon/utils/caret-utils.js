/**
 * getCaretPosition returns selection start and end according to selection
 * direction. If direction is backwards, the start will be the end of the
 * selection and vice versa.
 */

export function getCaretPosition(ctrl) {
  if (document.selection) {
    // IE < 9 Support
    ctrl.focus();
    const range = document.selection.createRange();
    const rangelen = range.text.length;
    range.moveStart('character', -ctrl.value.length);
    const start = range.text.length - rangelen;
    return {
      start,
      end: start + rangelen
    };
  } else if (ctrl.selectionStart || ctrl.selectionStart === 0) {
    // IE >=9 and other browsers
    const {
      selectionStart,
      selectionEnd,
      selectionDirection,
    } = ctrl;
    return {
      start: selectionDirection === "backward" ? selectionEnd : selectionStart,
      end: selectionDirection === "backward" ? selectionStart : selectionEnd,
    };
  }
  return {
    start: 0,
    end: 0
  };
}


export function setCaretPosition(ctrl, { start, end }) {

  if (ctrl.setSelectionRange) {
    // IE >= 9 and other browsers
    const isBackwards = start > end;
    ctrl.focus();
    ctrl.setSelectionRange(
      isBackwards ? end : start,
      isBackwards ? start : end,
      isBackwards ? "backward" : "forward"
    );
  } else if (ctrl.createTextRange) {
    // IE < 9
    const range = ctrl.createTextRange();
    range.collapse(true);
    range.moveEnd('character', end);
    range.moveStart('character', start);
    range.select();
  }
}
