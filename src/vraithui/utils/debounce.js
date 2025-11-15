/**
 * Debounce function - delays execution until after wait milliseconds
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @param {boolean} immediate - Trigger on leading edge instead of trailing
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 100, immediate = false) {
  let timeout;

  return function executedFunction(...args) {
    const context = this;

    const later = () => {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };

    const callNow = immediate && !timeout;

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func.apply(context, args);
  };
}

/**
 * Throttle function - ensures function is not called more than once per wait period
 * @param {Function} func - Function to throttle
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} Throttled function
 */
export function throttle(func, wait = 100) {
  let timeout;
  let previous = 0;

  return function executedFunction(...args) {
    const context = this;
    const now = Date.now();
    const remaining = wait - (now - previous);

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func.apply(context, args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now();
        timeout = null;
        func.apply(context, args);
      }, remaining);
    }
  };
}

/**
 * RAF (RequestAnimationFrame) debounce - useful for DOM updates
 * @param {Function} func - Function to debounce
 * @returns {Function} RAF debounced function
 */
export function rafDebounce(func) {
  let rafId = null;

  return function executedFunction(...args) {
    const context = this;

    if (rafId) {
      cancelAnimationFrame(rafId);
    }

    rafId = requestAnimationFrame(() => {
      func.apply(context, args);
      rafId = null;
    });
  };
}
