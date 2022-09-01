import expect from 'expect'

import {
  addArrayValue,
  blur,
  change,
  destroy,
  focus,
  initialize,
  removeArrayValue,
  reset,
  startAsyncValidation,
  startSubmit,
  stopAsyncValidation,
  stopSubmit,
  swapArrayValues,
  touch,
  untouch,
} from '../actions'
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
  SWAP_ARRAY_VALUES,
  TOUCH,
  UNTOUCH,
} from '../actionTypes'

describe('actions', () => {
  it('should create add array value action', () => {
    expect(addArrayValue('foo', undefined, 1)).toEqual({
      fields: undefined,
      index: 1,
      path: 'foo',
      type: ADD_ARRAY_VALUE,
      value: undefined,
    })
    expect(addArrayValue('bar.baz')).toEqual({
      fields: undefined,
      index: undefined,
      path: 'bar.baz',
      type: ADD_ARRAY_VALUE,
      value: undefined,
    })
    expect(addArrayValue('bar.baz', 'foo', 2)).toEqual({
      fields: undefined,
      index: 2,
      path: 'bar.baz',
      type: ADD_ARRAY_VALUE,
      value: 'foo',
    })
    expect(addArrayValue('bar.baz', 'foo', 2, ['x', 'y'])).toEqual({
      fields: ['x', 'y'],
      index: 2,
      path: 'bar.baz',
      type: ADD_ARRAY_VALUE,
      value: 'foo',
    })
  })

  it('should create blur action', () => {
    expect(blur('foo', 'bar')).toEqual({
      field: 'foo',
      type: BLUR,
      value: 'bar',
    })
    expect(blur('baz', 7)).toEqual({
      field: 'baz',
      type: BLUR,
      value: 7,
    })
  })

  it('should create change action', () => {
    expect(change('foo', 'bar')).toEqual({
      field: 'foo',
      type: CHANGE,
      value: 'bar',
    })
    expect(change('baz', 7)).toEqual({
      field: 'baz',
      type: CHANGE,
      value: 7,
    })
  })

  it('should create focus action', () => {
    expect(focus('foo')).toEqual({
      field: 'foo',
      type: FOCUS,
    })
  })

  it('should create initialize action', () => {
    const data = {a: 8, c: 9}
    const fields = ['a', 'c']
    expect(initialize(data, fields)).toEqual({data, fields, type: INITIALIZE})
  })

  it('should throw an error if initialize is not given a fields array', () => {
    expect(() => initialize({a: 1, b: 2}, undefined)).toThrow(/must provide fields array/)
    expect(() => initialize({a: 1, b: 2}, 'not an array')).toThrow(/must provide fields array/)
    expect(() => initialize({a: 1, b: 2}, {also: 'not an array'})).toThrow(/must provide fields array/)
  })

  it('should create remove array value action', () => {
    expect(removeArrayValue('foo', 3)).toEqual({
      index: 3,
      path: 'foo',
      type: REMOVE_ARRAY_VALUE,
    })
    expect(removeArrayValue('bar.baz')).toEqual({
      index: undefined,
      path: 'bar.baz',
      type: REMOVE_ARRAY_VALUE,
    })
  })

  it('should create reset action', () => {
    expect(reset()).toEqual({type: RESET})
  })

  it('should create destroy action', () => {
    expect(destroy()).toEqual({type: DESTROY})
  })

  it('should create startAsyncValidation action', () => {
    expect(startAsyncValidation('myField')).toEqual({
      field: 'myField',
      type: START_ASYNC_VALIDATION,
    })
  })

  it('should create startSubmit action', () => {
    expect(startSubmit()).toEqual({type: START_SUBMIT})
  })

  it('should create stopAsyncValidation action', () => {
    const errors = {
      bar: 'Error for bar',
      foo: 'Foo error',
    }
    expect(stopAsyncValidation(errors)).toEqual({
      errors,
      type: STOP_ASYNC_VALIDATION,
    })
  })

  it('should create stopSubmit action', () => {
    expect(stopSubmit()).toEqual({
      errors: undefined,
      type: STOP_SUBMIT,
    })
    const errors = {
      bar: 'Error for bar',
      foo: 'Foo error',
    }
    expect(stopSubmit(errors)).toEqual({
      errors,
      type: STOP_SUBMIT,
    })
  })

  it('should create swap array value action', () => {
    expect(swapArrayValues('foo', 3, 6)).toEqual({
      indexA: 3,
      indexB: 6,
      path: 'foo',
      type: SWAP_ARRAY_VALUES,
    })
    expect(swapArrayValues('foo', 3)).toEqual({
      indexA: 3,
      indexB: undefined,
      path: 'foo',
      type: SWAP_ARRAY_VALUES,
    })
    expect(swapArrayValues('bar.baz')).toEqual({
      indexA: undefined,
      indexB: undefined,
      path: 'bar.baz',
      type: SWAP_ARRAY_VALUES,
    })
  })

  it('should create touch action', () => {
    expect(touch('foo', 'bar')).toEqual({
      fields: ['foo', 'bar'],
      type: TOUCH,
    })
    expect(touch('cat', 'dog', 'pig')).toEqual({
      fields: ['cat', 'dog', 'pig'],
      type: TOUCH,
    })
  })

  it('should create untouch action', () => {
    expect(untouch('foo', 'bar')).toEqual({
      fields: ['foo', 'bar'],
      type: UNTOUCH,
    })
    expect(untouch('cat', 'dog', 'pig')).toEqual({
      fields: ['cat', 'dog', 'pig'],
      type: UNTOUCH,
    })
  })
})
