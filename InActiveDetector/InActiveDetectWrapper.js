import React, { Component } from 'react'
import {
  View,
  AppState,
  ScrollView,
} from 'react-native'
import MessageQueue from 'react-native/Libraries/BatchedBridge/MessageQueue'

import { setTimeoutAction, startTimeout, restartTimeout } from './InActiveDetectProvider'

class InActiveDetector extends Component {

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
    this.initialInActiveDetector()

    MessageQueue.spy(data => {
      const filterd = data.method === 'receiveTouches'
      if (!this.isTouching && filterd) {
        this.isTouching = true
        restartTimeout()
      } else if (data.method === 'receiveEvent' && data.args[1] === 'topScrollEndDrag') {
        this.isTouching = false
      }
    })
    AppState.addEventListener('change', this._handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = (nextAppState) => {
    if (nextAppState === 'inactive') {
      const today = new Date();
      const nowUnix = today.getTime()
      this.setState({
        inActiveTimeStamp: nowUnix
      })
    } else if (nextAppState === 'active') {
      const { inActiveTimeStamp, isIdled } = this.state
      if (inActiveTimeStamp > 0) {
        const today = new Date();
        const nowUnix = today.getTime()
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

  initialInActiveDetector = () => {
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
      <View
        style={{
          flex: 1,
          alignSelf: 'stretch',
          justifyContent: 'center',
          alignItems: 'center',
        }}

      >
        <ScrollView
          contentContainerStyle={{
            flex: 1,
            alignSelf: 'stretch',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          pointerEvents='box-none'
        >
          {this.props.children}
        </ScrollView>
      </View>
    )
  }
}

export default InActiveDetector;