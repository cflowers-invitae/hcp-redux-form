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
import {makeFieldValue} from './fieldValue'
import getValuesFromState from './getValuesFromState'
import initializeState from './initializeState'
import mapValues from './mapValues'
import normalizeFields from './normalizeFields'
import read from './read'
import resetState from './resetState'
import setErrors from './setErrors'
import write from './write'

export const globalErrorKey = '_error'

export const initialState = {
  _active: undefined,
  _asyncValidating: false,
  _initialized: false,
  _submitFailed: false,
  _submitting: false,
  [globalErrorKey]: undefined,
}

const behaviors = {
  [ADD_ARRAY_VALUE](state, {path, index, value, fields}) {
    const array = read(path, state)
    const stateCopy = {...state}
    const arrayCopy = array ? [...array] : []
    const newValue =
      value !== null && typeof value === 'object'
        ? initializeState(value, fields || Object.keys(value))
        : makeFieldValue({value})
    if (index === undefined) {
      arrayCopy.push(newValue)
    } else {
      arrayCopy.splice(index, 0, newValue)
    }
    return write(path, arrayCopy, stateCopy)
  },
  [BLUR](state, {field, value, touch}) {
    // remove _active from state
    const {_active, ...stateCopy} = state
    return write(
      field,
      previous => {
        const result = {...previous}
        if (value !== undefined) {
          result.value = value
        }
        if (touch) {
          result.touched = true
        }
        return makeFieldValue(result)
      },
      stateCopy,
    )
  },
  [CHANGE](state, {field, value, touch}) {
    return write(
      field,
      previous => {
        const {asyncError, submitError, ...result} = {...previous, value}
        if (touch) {
          result.touched = true
        }
        return makeFieldValue(result)
      },
      state,
    )
  },
  [DESTROY]() {
    return undefined
  },
  [FOCUS](state, {field}) {
    const stateCopy = write(field, previous => makeFieldValue({...previous, visited: true}), state)
    stateCopy._active = field
    return stateCopy
  },
  [INITIALIZE](state, {data, fields}) {
    return {
      ...initializeState(data, fields, state),
      _active: undefined,
      _asyncValidating: false,
      _initialized: true,
      _submitFailed: false,
      _submitting: false,
      [globalErrorKey]: undefined,
    }
  },
  [REMOVE_ARRAY_VALUE](state, {path, index}) {
    const array = read(path, state)
    const stateCopy = {...state}
    const arrayCopy = array ? [...array] : []
    if (index === undefined) {
      arrayCopy.pop()
    } else if (isNaN(index)) {
      delete arrayCopy[index]
    } else {
      arrayCopy.splice(index, 1)
    }
    return write(path, arrayCopy, stateCopy)
  },
  [RESET](state) {
    return {
      ...resetState(state),
      _active: undefined,
      _asyncValidating: false,
      _initialized: state._initialized,
      _submitFailed: false,
      _submitting: false,
      [globalErrorKey]: undefined,
    }
  },
  [START_ASYNC_VALIDATION](state, {field}) {
    return {
      ...state,
      _asyncValidating: field || true,
    }
  },
  [START_SUBMIT](state) {
    return {
      ...state,
      _submitting: true,
    }
  },
  [STOP_ASYNC_VALIDATION](state, {errors}) {
    return {
      ...setErrors(state, errors, 'asyncError'),
      _asyncValidating: false,
      [globalErrorKey]: errors && errors[globalErrorKey],
    }
  },
  [STOP_SUBMIT](state, {errors}) {
    return {
      ...setErrors(state, errors, 'submitError'),
      _submitFailed: !!(errors && Object.keys(errors).length),
      _submitting: false,
      [globalErrorKey]: errors && errors[globalErrorKey],
    }
  },
  [SUBMIT_FAILED](state) {
    return {
      ...state,
      _submitFailed: true,
    }
  },
  [SWAP_ARRAY_VALUES](state, {path, indexA, indexB}) {
    const array = read(path, state)
    const arrayLength = array.length
    if (indexA === indexB || isNaN(indexA) || isNaN(indexB) || indexA >= arrayLength || indexB >= arrayLength) {
      return state // do nothing
    }
    const stateCopy = {...state}
    const arrayCopy = [...array]
    arrayCopy[indexA] = array[indexB]
    arrayCopy[indexB] = array[indexA]
    return write(path, arrayCopy, stateCopy)
  },
  [TOUCH](state, {fields}) {
    return {
      ...state,
      ...fields.reduce(
        (accumulator, field) => write(field, value => makeFieldValue({...value, touched: true}), accumulator),
        state,
      ),
    }
  },
  [UNTOUCH](state, {fields}) {
    return {
      ...state,
      ...fields.reduce(
        (accumulator, field) =>
          write(
            field,
            value => {
              if (value) {
                const {touched, ...rest} = value
                return makeFieldValue(rest)
              }
              return makeFieldValue(value)
            },
            accumulator,
          ),
        state,
      ),
    }
  },
}

const reducer = (state = initialState, action = {}) => {
  const behavior = behaviors[action.type]
  return behavior ? behavior(state, action) : state
}

function formReducer(state = {}, action = {}) {
  const {form, key, ...rest} = action
  if (!form) {
    return state
  }
  if (key) {
    if (action.type === DESTROY) {
      return {
        ...state,
        [form]:
          state[form] &&
          Object.keys(state[form]).reduce(
            (accumulator, stateKey) =>
              stateKey === key
                ? accumulator
                : {
                    ...accumulator,
                    [stateKey]: state[form][stateKey],
                  },
            {},
          ),
      }
    }
    return {
      ...state,
      [form]: {
        ...state[form],
        [key]: reducer((state[form] || {})[key], rest),
      },
    }
  }
  if (action.type === DESTROY) {
    return Object.keys(state).reduce(
      (accumulator, formName) =>
        formName === form
          ? accumulator
          : {
              ...accumulator,
              [formName]: state[formName],
            },
      {},
    )
  }
  return {
    ...state,
    [form]: reducer(state[form], rest),
  }
}

/**
 * Adds additional functionality to the reducer
 */
function decorate(target) {
  target.plugin = function plugin(reducers) {
    // use 'function' keyword to enable 'this'
    return decorate((state = {}, action = {}) => {
      const result = this(state, action)
      return {
        ...result,
        ...mapValues(reducers, (pluginReducer, key) => pluginReducer(result[key] || initialState, action)),
      }
    })
  }

  target.normalize = function normalize(normalizers) {
    // use 'function' keyword to enable 'this'
    return decorate((state = {}, action = {}) => {
      const result = this(state, action)
      return {
        ...result,
        ...mapValues(normalizers, (formNormalizers, form) => {
          const runNormalize = (previous, currentResult) => {
            const previousValues = getValuesFromState({
              ...initialState,
              ...previous,
            })
            const formResult = {
              ...initialState,
              ...currentResult,
            }
            const values = getValuesFromState(formResult)
            return normalizeFields(formNormalizers, formResult, previous, values, previousValues)
          }
          if (action.key) {
            return {
              ...result[form],
              [action.key]: runNormalize(state[form][action.key], result[form][action.key]),
            }
          }
          return runNormalize(state[form], result[form])
        }),
      }
    })
  }

  return target
}

export default decorate(formReducer)
