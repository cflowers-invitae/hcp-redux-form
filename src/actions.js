import {
  ADD_ARRAY_VALUE,
  BLUR,
  CHANGE,
  DESTROY,
  FOCUS,
  INITIALIZE,
  REMOVE_ARRAY_VALUE,
  RESET,
  START_ASYNC_VALIDATION,
  START_SUBMIT,
  STOP_ASYNC_VALIDATION,
  STOP_SUBMIT,
  SUBMIT_FAILED,
  SWAP_ARRAY_VALUES,
  TOUCH,
  UNTOUCH,
} from './actionTypes'

export const addArrayValue = (path, value, index, fields) => ({fields, index, path, type: ADD_ARRAY_VALUE, value})

export const blur = (field, value) => ({field, type: BLUR, value})

export const change = (field, value) => ({field, type: CHANGE, value})

export const destroy = () => ({type: DESTROY})

export const focus = field => ({field, type: FOCUS})

export const initialize = (data, fields) => {
  if (!Array.isArray(fields)) {
    throw new Error('must provide fields array to initialize() action creator')
  }
  return {data, fields, type: INITIALIZE}
}

export const removeArrayValue = (path, index) => ({index, path, type: REMOVE_ARRAY_VALUE})

export const reset = () => ({type: RESET})

export const startAsyncValidation = field => ({field, type: START_ASYNC_VALIDATION})

export const startSubmit = () => ({type: START_SUBMIT})

export const stopAsyncValidation = errors => ({errors, type: STOP_ASYNC_VALIDATION})

export const stopSubmit = errors => ({errors, type: STOP_SUBMIT})

export const submitFailed = () => ({type: SUBMIT_FAILED})

export const swapArrayValues = (path, indexA, indexB) => ({indexA, indexB, path, type: SWAP_ARRAY_VALUES})

export const touch = (...fields) => ({fields, type: TOUCH})

export const untouch = (...fields) => ({fields, type: UNTOUCH})
