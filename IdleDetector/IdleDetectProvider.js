let timeout = 1000
let timeOutHandler
let action
let timeoutRunning = false

/**
 * _clearTimeoutHandler
 * ---
 * @description
 * clearing idle timer
 */
const _clearTimeoutHandler = async () => {
  timeoutRunning = false
  clearTimeout(timeOutHandler)
}

/**
 * setTimeoutAction
 * ---
 * @description
 * set up the action that be called after time out.
 * @param {function} timeoutAction 
 * @param {number} timeoutDuration 
 */
export const setTimeoutAction = (timeoutAction, timeoutDuration) => {
  if (typeof timeoutAction === 'function') {
    action = timeoutAction
    timeout = timeoutDuration
  }
}

/**
 * startTimeout
 * ---
 * @description
 * Starting run timer of IdleTimer
 */
export const startTimeout = () => {
  if (!timeoutRunning && action && timeout > 0) {
    timeoutRunning = true
    timeOutHandler = setTimeout(() => {
      action()
      timeoutRunning = false
    }, timeout);
  } else {
    timeoutRunning = false
  }
}

/**
 * restartTimeout
 * ---
 * @description
 * clear Idle timer and restart new one
 */
export const restartTimeout = async () => {
  await _clearTimeoutHandler()
  startTimeout()
}