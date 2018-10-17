import React, { Component } from 'react'
import { AppState } from 'react-native'
import MessageQueue from 'react-native/Libraries/BatchedBridge/MessageQueue'
import PropTypes from 'prop-types'

import {
  setTimeoutAction,
  startTimeout,
  restartTimeout
} from './IdleDetectProvider'

class IdleDetectWrapper extends Component {

  state = {
    inActiveTimeStamp: 0,
    isIdled: false,
  }

  isTouching = false

  static defaultProps = {
    onIdle() { },
    maxIdleDuration: 5000,
    disabled: false,
  }

  static propTypes = {
    onIdle: PropTypes.func,
    maxIdleDuration: PropTypes.number,
    children: PropTypes.element,
    disabled: PropTypes.bool,
  }

  componentDidMount() {
    if (!this.props.disabled) {
      this._initialInActiveDetector()

      /** Spy the message on ReactNative Bridge and detect touch event */
      MessageQueue.spy(data => {
        const filterd = data.method === 'receiveTouches'
        if (filterd) {
          this.isTouching = true
          restartTimeout()
        } else if (data.method === 'receiveEvent' && data.args[1] === 'topScrollEndDrag') {
          this.isTouching = false
        }
      })
      /** Handle on AppState change active => background/inactive  */
      AppState.addEventListener('change', this._handleAppStateChange);
    }
  }

  componentWillUnmount() {
    if (!this.props.disabled) {
      AppState.removeEventListener('change', this._handleAppStateChange);
    }
  }

  /**
   * _handleAppStateChange
   * ---
   * @description
   * handler idle time when appState be changed
   * @param {string} nextAppState
   */
  _handleAppStateChange = (nextAppState) => {
    const today = new Date();
    const nowUnix = today.getTime()
    if (nextAppState === 'inactive') {
      this.setState({
        inActiveTimeStamp: nowUnix
      })
    } else if (nextAppState === 'active') {
      const { inActiveTimeStamp, isIdled } = this.state
      if (inActiveTimeStamp > 0) {
        const inActiveDuration = nowUnix - inActiveTimeStamp
        const { maxIdleDuration, onIdle } = this.props
        if (inActiveDuration > maxIdleDuration) {
          if (!isIdled) {
            onIdle()
            this.setState({
              isIdled: true
            })
          }
        } else {
          restartTimeout()
        }
      }
    }
  }

  /**
   * _initialInActiveDetector
   * ---
   * @description
   * initialize action that be called after idle and set up idle duration
   */
  _initialInActiveDetector = () => {
    const {
      onIdle,
      maxIdleDuration,
    } = this.props
    const { isIdled } = this.state
    setTimeoutAction(() => {
      if (!isIdled) {
        onIdle()
        this.setState({
          isIdled: true
        })
      }
    }, maxIdleDuration)
    startTimeout()
  }

  render() {
    return (
      <React.Fragment>
        {this.props.children}
      </React.Fragment>
    )
  }
}

export default IdleDetectWrapper;