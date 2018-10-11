import React, { Component } from 'react'
import {
  View,
  AppState,
  StyleSheet,
} from 'react-native'
import MessageQueue from 'react-native/Libraries/BatchedBridge/MessageQueue'

import {
  setTimeoutAction,
  startTimeout,
  restartTimeout
} from './IdleDetectProvider'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
  }
})

class IdleDetectWrapper extends Component {

  state = {
    inActiveTimeStamp: 0,
    isIdled: false,
  }

  isTouching = false

  static defaultProps = {
    onIdle() { },
    maxIdleDuration: 5000
  }

  componentDidMount() {
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

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
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
   * initialize action that be called after idle and idle duration
   */
  _initialInActiveDetector = () => {
    const { onIdle, isIdled, maxIdleDuration } = this.props
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
      <View style={styles.container}>
        {this.props.children}
      </View>
    )
  }
}

export default IdleDetectWrapper;