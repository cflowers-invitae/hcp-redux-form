import expect from 'expect'

import bindActionData from '../bindActionData'

describe('bindActionData', () => {
  it('should return a function when called with a function', () => {
    expect(bindActionData(() => ({foo: 'bar'}), {baz: 7}))
      .toExist()
      .toBeA('function')
  })

  it('should add keys when called with a function', () => {
    expect(bindActionData(() => ({foo: 'bar'}), {baz: 7})()).toEqual({
      baz: 7,
      foo: 'bar',
    })
  })

  it('should pass along arguments when called with a function', () => {
    const action = bindActionData(data => ({foo: data}), {baz: 7})
    expect(action('dog')).toEqual({
      baz: 7,
      foo: 'dog',
    })
    expect(action('cat')).toEqual({
      baz: 7,
      foo: 'cat',
    })
  })

  it('should return an object when called with an object', () => {
    const actions = bindActionData(
      {
        a: () => ({foo: 'bar'}),
        b: () => ({cat: 'ralph'}),
      },
      {baz: 7},
    )
    expect(actions).toExist().toBeA('object')
    expect(Object.keys(actions).length).toBe(2)
    expect(actions.a).toExist().toBeA('function')
    expect(actions.b).toExist().toBeA('function')
  })

  it('should add keys when called with an object', () => {
    const actions = bindActionData(
      {
        a: () => ({foo: 'bar'}),
        b: () => ({cat: 'ralph'}),
      },
      {baz: 7},
    )
    expect(actions.a()).toEqual({
      baz: 7,
      foo: 'bar',
    })
    expect(actions.b()).toEqual({
      baz: 7,
      cat: 'ralph',
    })
  })

  it('should pass along arguments when called with an object', () => {
    const actions = bindActionData(
      {
        a: value => ({foo: value}),
        b: value => ({cat: value}),
      },
      {baz: 9},
    )
    expect(actions.a('dog')).toEqual({
      baz: 9,
      foo: 'dog',
    })
    expect(actions.b('Bob')).toEqual({
      baz: 9,
      cat: 'Bob',
    })
  })
})
