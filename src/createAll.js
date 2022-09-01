import * as actions from './actions'
import * as actionTypes from './actionTypes'
import bindActionData from './bindActionData'
import createPropTypes from './createPropTypes'
import createReduxForm from './createReduxForm'
import getValues from './getValuesFromState'
import mapValues from './mapValues'
import reducer from './reducer'

// bind form as first parameter of action creators
const boundActions = {
  ...mapValues(
    {
      ...actions,
      changeWithKey: (key, ...args) => bindActionData(actions.change, {key})(...args),
      destroy: key => bindActionData(actions.destroy, {key})(),
      initializeWithKey: (key, ...args) => bindActionData(actions.initialize, {key})(...args),
      reset: key => bindActionData(actions.reset, {key})(),
      touchWithKey: (key, ...args) => bindActionData(actions.touch, {key})(...args),
      untouchWithKey: (key, ...args) => bindActionData(actions.untouch, {key})(...args),
    },
    action =>
      (form, ...args) =>
        bindActionData(action, {form})(...args),
  ),
}

const addArrayValue = boundActions.addArrayValue
const blur = boundActions.blur
const change = boundActions.change
const changeWithKey = boundActions.changeWithKey
const destroy = boundActions.destroy
const focus = boundActions.focus
const initialize = boundActions.initialize
const initializeWithKey = boundActions.initializeWithKey
const removeArrayValue = boundActions.removeArrayValue
const reset = boundActions.reset
const startAsyncValidation = boundActions.startAsyncValidation
const startSubmit = boundActions.startSubmit
const stopAsyncValidation = boundActions.stopAsyncValidation
const stopSubmit = boundActions.stopSubmit
const submitFailed = boundActions.submitFailed
const swapArrayValues = boundActions.swapArrayValues
const touch = boundActions.touch
const touchWithKey = boundActions.touchWithKey
const untouch = boundActions.untouch
const untouchWithKey = boundActions.untouchWithKey

export default function createAll(isReactNative, React, PropTypes, connect) {
  return {
    actionTypes,
    addArrayValue,
    blur,
    change,
    changeWithKey,
    destroy,
    focus,
    getValues,
    initialize,
    initializeWithKey,
    propTypes: createPropTypes(PropTypes),
    reducer,
    reduxForm: createReduxForm(isReactNative, React, PropTypes, connect),
    removeArrayValue,
    reset,
    startAsyncValidation,
    startSubmit,
    stopAsyncValidation,
    stopSubmit,
    submitFailed,
    swapArrayValues,
    touch,
    touchWithKey,
    untouch,
    untouchWithKey,
  }
}
