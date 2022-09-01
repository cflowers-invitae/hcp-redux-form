import expect from 'expect'

import {makeFieldValue} from '../fieldValue'
import getValuesFromState from '../getValuesFromState'

describe('getValuesFromState', () => {
  it('should get simple values from state', () => {
    const state = {
      alive: makeFieldValue({value: true}),
      catLives: makeFieldValue({value: 9}),
      foo: makeFieldValue({value: 'bar'}),
      value: makeFieldValue({value: 'value'}),
    }
    expect(getValuesFromState(state)).toBeA('object').toEqual({
      alive: true,
      catLives: 9,
      foo: 'bar',
      value: 'value',
    })
  })

  it('should understand undefined values that have only been touched', () => {
    const state = {
      bar: makeFieldValue({touched: true}),
      baz: makeFieldValue({touched: true}),
      foo: makeFieldValue({touched: true, value: 'dog'}),
    }
    expect(getValuesFromState(state)).toBeA('object').toEqual({
      foo: 'dog',
    })
  })

  it('should get deep values from state', () => {
    const state = {
      alive: makeFieldValue({value: true}),
      foo: {
        bar: makeFieldValue({value: 'baz'}),
      },
      lives: {
        cat: makeFieldValue({value: 9}),
      },
    }
    expect(getValuesFromState(state))
      .toBeA('object')
      .toEqual({
        alive: true,
        foo: {
          bar: 'baz',
        },
        lives: {
          cat: 9,
        },
      })
  })

  it('should get date values from state', () => {
    const date1 = new Date()
    const date2 = new Date(date1.getTime() + 1)
    const state = {
      time1: {
        value: date1,
      },
      time2: {
        value: date2,
      },
    }
    expect(getValuesFromState(state)).toBeA('object').toEqual({
      time1: date1,
      time2: date2,
    })
  })

  it('should get undefined values from state', () => {
    const state = {
      bar: {
        value: undefined,
      },
      foo: {
        value: undefined,
      },
    }
    expect(getValuesFromState(state)).toBeA('object').toEqual({})
  })

  it('should get null values from state', () => {
    const state = {
      bar: {
        value: null,
      },
      foo: {
        value: null,
      },
    }
    expect(getValuesFromState(state)).toBeA('object').toEqual({
      bar: null,
      foo: null,
    })
  })

  it('should get empty string values from state', () => {
    const state = {
      bar: {
        value: '',
      },
      foo: {
        value: '',
      },
    }
    expect(getValuesFromState(state)).toBeA('object').toEqual({
      bar: '',
      foo: '',
    })
  })

  it('should get array values from state', () => {
    const state = {
      alive: makeFieldValue({value: true}),
      foo: [makeFieldValue({value: 'bar'}), makeFieldValue({value: 'baz'}), {}],
    }
    expect(getValuesFromState(state))
      .toBeA('object')
      .toEqual({
        alive: true,
        foo: ['bar', 'baz', undefined],
      })
  })

  it('should allow an array to be empty', () => {
    const state = {
      foo: [],
    }
    expect(getValuesFromState(state)).toBeA('object').toEqual({foo: []})
  })

  it('should get deep array values from state', () => {
    const state = {
      bar: [
        {
          deeper: {
            value: 42,
          },
        },
      ],
      foo: {
        animals: [makeFieldValue({value: 'cat'}), makeFieldValue({value: 'dog'}), makeFieldValue({value: 'rat'})],
      },
    }
    expect(getValuesFromState(state))
      .toBeA('object')
      .toEqual({
        bar: [{deeper: 42}],
        foo: {
          animals: ['cat', 'dog', 'rat'],
        },
      })
  })

  it('should ignore values starting with _', () => {
    const state = {
      _someMetaValue: 'rat',
      bar: {
        value: 'cat',
      },
      foo: {
        value: 'dog',
      },
    }
    expect(getValuesFromState(state)).toBeA('object').toEqual({
      bar: 'cat',
      foo: 'dog',
    })
  })

  it('should ignore visited fields without values', () => {
    const state = {
      bar: {
        visited: true,
      },
      foo: {
        value: 'dog',
      },
    }
    expect(getValuesFromState(state)).toBeA('object').toEqual({
      foo: 'dog',
    })
  })

  it('should get deep array of objects from state', () => {
    const state = {
      foo: {
        animals: [
          {key: makeFieldValue({value: 'k1'}), value: makeFieldValue({value: 'v1'})},
          {key: makeFieldValue({value: 'k2'}), value: makeFieldValue({value: 'v2'})},
        ],
      },
    }
    expect(getValuesFromState(state))
      .toBeA('object')
      .toEqual({
        foo: {
          animals: [
            {key: 'k1', value: 'v1'},
            {key: 'k2', value: 'v2'},
          ],
        },
      })
  })
})
