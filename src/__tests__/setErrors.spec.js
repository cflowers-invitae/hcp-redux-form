import expect from 'expect'

import {makeFieldValue} from '../fieldValue'
import setErrors from '../setErrors'

describe('setErrors', () => {
  it('should not change if no errors', () => {
    expect(setErrors({bar: true, foo: 42}, {}, '__err')).toEqual({bar: true, foo: 42})
  })

  it('should not change if no errors and no state', () => {
    expect(setErrors(undefined, {}, '__err')).toEqual(undefined)
  })

  it('should set errors even when state is empty', () => {
    expect(
      setErrors(
        {},
        {
          bar: 'barError',
          foo: 'fooError',
        },
        '__err',
      ),
    ).toEqual({
      bar: {
        __err: 'barError',
      },
      foo: {
        __err: 'fooError',
      },
    })
  })

  it('should set errors even when state is null', () => {
    expect(
      setErrors(
        null,
        {
          foo: 'fooError',
        },
        '__err',
      ),
    ).toEqual({
      foo: {
        __err: 'fooError',
      },
    })
  })

  it('should ignore meta keys', () => {
    expect(
      setErrors(
        {},
        {
          _startsWithUnderscore: 'shouldBeIgnored',
        },
        '__err',
      ),
    ).toEqual({})
  })

  it('should set nested errors even when no state', () => {
    expect(
      setErrors(
        {},
        {
          dog: {
            bar: 'barError',
            foo: 'fooError',
          },
        },
        '__err',
      ),
    ).toEqual({
      dog: {
        bar: {
          __err: 'barError',
        },
        foo: {
          __err: 'fooError',
        },
      },
    })
  })

  it('should set array errors even when no state', () => {
    expect(
      setErrors(
        {},
        {
          dog: ['fooError', 'barError'],
        },
        '__err',
      ),
    ).toEqual({
      dog: [
        {
          __err: 'fooError',
        },
        {
          __err: 'barError',
        },
      ],
    })
  })

  it('should set simple error', () => {
    expect(
      setErrors(
        {
          cat: makeFieldValue({
            value: 'rat',
          }),
          foo: makeFieldValue({
            value: 'bar',
          }),
        },
        {
          cat: 'meow',
          foo: 'fooError',
        },
        '__err',
      ),
    ).toEqual({
      cat: {
        __err: 'meow',
        value: 'rat',
      },
      foo: {
        __err: 'fooError',
        value: 'bar',
      },
    })
  })

  it('should unset simple error', () => {
    expect(
      setErrors(
        {
          cat: makeFieldValue({
            __err: 'meow',
            value: 'rat',
          }),
          foo: makeFieldValue({
            __err: 'fooError',
            value: 'bar',
          }),
        },
        {},
        '__err',
      ),
    ).toEqual({
      cat: {
        value: 'rat',
      },
      foo: {
        value: 'bar',
      },
    })
  })

  it('should set simple error with first error if given an array', () => {
    expect(
      setErrors(
        {
          foo: makeFieldValue({
            value: 'bar',
          }),
        },
        {
          foo: ['fooError1', 'fooError2'],
        },
        '__err',
      ),
    ).toEqual({
      foo: {
        __err: 'fooError1',
        value: 'bar',
      },
    })
  })

  it('should set nested error', () => {
    expect(
      setErrors(
        {
          dog: {
            foo: makeFieldValue({
              value: 'bar',
            }),
          },
        },
        {
          dog: {
            foo: 'fooError',
          },
        },
        '__err',
      ),
    ).toEqual({
      dog: {
        foo: {
          __err: 'fooError',
          value: 'bar',
        },
      },
    })
  })

  it('should unset nested error', () => {
    expect(
      setErrors(
        {
          dog: {
            foo: makeFieldValue({
              __err: 'fooError',
              value: 'bar',
            }),
          },
        },
        {},
        '__err',
      ),
    ).toEqual({
      dog: {
        foo: {
          value: 'bar',
        },
      },
    })
  })

  it('should set deep object error', () => {
    expect(
      setErrors(
        {
          foo: makeFieldValue({
            value: 'bar',
          }),
        },
        {
          foo: {
            error: 'value',
            some: 'complex',
          },
        },
        '__err',
      ),
    ).toEqual({
      foo: {
        __err: {
          error: 'value',
          some: 'complex',
        },
        value: 'bar',
      },
    })
  })

  it('should set nested error with first error if given an array', () => {
    expect(
      setErrors(
        {
          dog: {
            foo: makeFieldValue({
              value: 'bar',
            }),
          },
        },
        {
          dog: {
            foo: ['fooError1', 'fooError2'],
          },
        },
        '__err',
      ),
    ).toEqual({
      dog: {
        foo: {
          __err: 'fooError1',
          value: 'bar',
        },
      },
    })
  })

  it('should set array error when state is array', () => {
    expect(
      setErrors(
        {
          foo: [
            makeFieldValue({
              value: 'bar',
            }),
          ],
        },
        {
          foo: ['fooError', 'additionalErrorForUndefinedField'],
        },
        '__err',
      ),
    ).toEqual({
      foo: [
        {
          __err: 'fooError',
          value: 'bar',
        },
        {
          __err: 'additionalErrorForUndefinedField',
        },
      ],
    })
  })

  it('should unset array error when state is array', () => {
    expect(
      setErrors(
        {
          foo: [
            makeFieldValue({
              __err: 'fooError',
              value: 'bar',
            }),
          ],
        },
        {
          foo: [],
        },
        '__err',
      ),
    ).toEqual({
      foo: [
        {
          value: 'bar',
        },
      ],
    })
    expect(
      setErrors(
        {
          foo: [
            makeFieldValue({
              __err: 'fooError',
              value: 'bar',
            }),
          ],
        },
        {},
        '__err',
      ),
    ).toEqual({
      foo: [
        {
          value: 'bar',
        },
      ],
    })
  })
})
