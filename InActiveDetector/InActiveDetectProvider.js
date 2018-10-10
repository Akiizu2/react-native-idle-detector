let timeout = 1000
let timeOutHandler
let action
let timeoutRunning = false

const clearTimeoutHandler = () => {
  timeoutRunning = false
  clearTimeout(timeOutHandler)
}

export const setTimeoutAction = (timeoutAction, timeoutDuration) => {
  if (typeof timeoutAction === 'function') {
    action = timeoutAction
    timeout = timeoutDuration
  }
}

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

export const restartTimeout = async () => {
  await clearTimeoutHandler()
  startTimeout()
}