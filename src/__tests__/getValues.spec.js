import expect from 'expect'

import getValues from '../getValues'

describe('getValues', () => {
  it('should get values from form', () => {
    const form = {
      alive: {value: true},
      catLives: {value: 9},
      foo: {value: 'bar'},
    }
    const fields = ['foo', 'catLives', 'alive']
    expect(getValues(fields, form)).toBeA('object').toEqual({
      alive: true,
      catLives: 9,
      foo: 'bar',
    })
  })

  it('should allow undefined values', () => {
    const form = {
      foo: {value: 'bar'},
    }
    const fields = ['foo', 'missing']
    expect(getValues(fields, form)).toBeA('object').toEqual({
      foo: 'bar',
      missing: undefined,
    })
  })

  it('should get values from deep form', () => {
    const form = {
      alive: {value: true},
      foo: {
        bar: {value: 'baz'},
      },
      lives: {
        cat: {value: 9},
      },
    }
    const fields = ['foo.bar', 'lives.cat', 'alive']
    expect(getValues(fields, form))
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

  it('should get values from array form', () => {
    const form = {
      alive: {value: true},
      foo: [{value: 'bar'}, {value: 'baz'}, {}],
    }
    const fields = ['foo[]', 'alive']
    expect(getValues(fields, form))
      .toBeA('object')
      .toEqual({
        alive: true,
        foo: ['bar', 'baz', undefined],
      })
  })

  it('should allow an array to be empty', () => {
    const form = {
      foo: [],
    }
    const fields = ['foo[]']
    expect(getValues(fields, form)).toBeA('object').toEqual({foo: []})
  })

  it('should get values from deep array form', () => {
    const form = {
      bar: [
        {
          deeper: {
            value: 42,
          },
        },
      ],
      foo: {
        animals: [{value: 'cat'}, {value: 'dog'}, {value: 'rat'}],
      },
    }
    const fields = ['foo.animals[]', 'bar[].deeper']
    expect(getValues(fields, form))
      .toBeA('object')
      .toEqual({
        bar: [{deeper: 42}],
        foo: {
          animals: ['cat', 'dog', 'rat'],
        },
      })
  })

  it('should ignore visited fields without values', () => {
    const form = {
      bar: {
        visited: true,
      },
      foo: {
        value: 'dog',
      },
    }
    const fields = ['foo', 'bar']
    expect(getValues(fields, form)).toBeA('object').toEqual({
      bar: undefined,
      foo: 'dog',
    })
  })
})
