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
import bindActionData from '../bindActionData'
import {isFieldValue, makeFieldValue} from '../fieldValue'
import reducer, {globalErrorKey} from '../reducer'

const compare = (a, b) => {
  if (a.value > b.value) {
    return 1
  }
  if (a.value < b.value) {
    return -1
  }
  return 0
}

describe('reducer', () => {
  it('should initialize state to {}', () => {
    const state = reducer()
    expect(state).toExist().toBeA('object')
    expect(Object.keys(state).length).toBe(0)
  })

  it('should not modify state when action has no form', () => {
    const state = {foo: 'bar'}
    expect(reducer(state, {type: 'SOMETHING_ELSE'})).toBe(state)
  })

  it('should initialize form state when action has form', () => {
    const state = reducer(undefined, {form: 'foo'})
    expect(state).toExist().toBeA('object')
    expect(Object.keys(state).length).toBe(1)
    expect(state.foo)
      .toExist()
      .toBeA('object')
      .toEqual({
        _active: undefined,
        _asyncValidating: false,
        _initialized: false,
        _submitFailed: false,
        _submitting: false,
        [globalErrorKey]: undefined,
      })
  })

  it('should add an empty array value with empty state', () => {
    const state = reducer(
      {},
      {
        ...addArrayValue('myField'),
        form: 'foo',
      },
    )
    expect(state.foo).toEqual({
      _active: undefined,
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      [globalErrorKey]: undefined,
      myField: [
        {
          value: undefined,
        },
      ],
    })
    expect(isFieldValue(state.foo.myField)).toBe(false)
    expect(isFieldValue(state.foo.myField[0])).toBe(true)
  })

  it('should add an empty deep array value with empty state', () => {
    const state = reducer(
      {},
      {
        ...addArrayValue('myField.myArray'),
        form: 'foo',
      },
    )
    expect(state.foo).toEqual({
      _active: undefined,
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      [globalErrorKey]: undefined,
      myField: {
        myArray: [
          {
            value: undefined,
          },
        ],
      },
    })
    expect(isFieldValue(state.foo.myField)).toBe(false)
    expect(isFieldValue(state.foo.myField.myArray)).toBe(false)
    expect(isFieldValue(state.foo.myField.myArray[0])).toBe(true)
  })

  it('should add a deep array value with initial value', () => {
    const state = reducer(
      {},
      {
        ...addArrayValue('myField.myArray', 20, undefined),
        form: 'foo',
      },
    )
    expect(state.foo).toEqual({
      _active: undefined,
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      [globalErrorKey]: undefined,
      myField: {
        myArray: [
          {
            value: 20,
          },
        ],
      },
    })
    expect(isFieldValue(state.foo.myField)).toBe(false)
    expect(isFieldValue(state.foo.myField.myArray)).toBe(false)
    expect(isFieldValue(state.foo.myField.myArray[0])).toBe(true)
  })

  it('should push an array value', () => {
    const state = reducer(
      {
        testForm: {
          _active: undefined,
          _asyncValidating: false,
          _initialized: false,
          _submitFailed: false,
          _submitting: false,
          [globalErrorKey]: undefined,
          myField: [
            makeFieldValue({
              value: 'foo',
            }),
            makeFieldValue({
              value: 'bar',
            }),
          ],
        },
      },
      {
        ...addArrayValue('myField', 'baz'),
        form: 'testForm',
      },
    )
    expect(state.testForm).toEqual({
      _active: undefined,
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      [globalErrorKey]: undefined,
      myField: [
        {
          value: 'foo',
        },
        {
          value: 'bar',
        },
        {
          value: 'baz',
        },
      ],
    })
    expect(isFieldValue(state.testForm.myField)).toBe(false)
    expect(isFieldValue(state.testForm.myField[0])).toBe(true)
    expect(isFieldValue(state.testForm.myField[1])).toBe(true)
    expect(isFieldValue(state.testForm.myField[2])).toBe(true)
  })

  it('should insert an array value', () => {
    const state = reducer(
      {
        testForm: {
          _active: undefined,
          _asyncValidating: false,
          _initialized: false,
          _submitFailed: false,
          _submitting: false,
          [globalErrorKey]: undefined,
          myField: [
            makeFieldValue({
              value: 'foo',
            }),
            makeFieldValue({
              value: 'bar',
            }),
          ],
        },
      },
      {
        ...addArrayValue('myField', 'baz', 1),
        form: 'testForm',
      },
    )
    expect(state.testForm).toEqual({
      _active: undefined,
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      [globalErrorKey]: undefined,
      myField: [
        {
          value: 'foo',
        },
        {
          value: 'baz',
        },
        {
          value: 'bar',
        },
      ],
    })
    expect(isFieldValue(state.testForm.myField)).toBe(false)
    expect(isFieldValue(state.testForm.myField[0])).toBe(true)
    expect(isFieldValue(state.testForm.myField[1])).toBe(true)
    expect(isFieldValue(state.testForm.myField[2])).toBe(true)
  })

  // TODO: Find a way to make this pass:
  /*
   it('should push an array value which is a deep object', () => {
   const state = reducer({
   testForm: {
   friends: [
   {
   name: {
   initial: 'name-1',
   value: 'name-1'
   },
   address: {
   street: {
   initial: 'street-1',
   value: 'street-1'
   },
   postalCode: {
   initial: 'postalCode-1',
   value: 'postalCode-1'
   }
   }
   },
   {
   name: {
   initial: 'name-2',
   value: 'name-2'
   },
   address: {
   street: {
   initial: 'street-2',
   value: 'street-2'
   },
   postalCode: {
   initial: 'postalCode-2',
   value: 'postalCode-2'
   }
   }
   }
   ],
   _active: undefined,
   _asyncValidating: false,
   _error: undefined,
   _initialized: false,
   _submitting: false,
   _submitFailed: false
   }
   }, {
   ...addArrayValue('friends', {
   name: 'name-3',
   address: {
   street: 'street-3',
   postalCode: 'postalCode-3'
   }
   }, undefined),
   form: 'testForm'
   });
   expect(state.testForm)
   .toEqual({
   friends: [
   {
   name: {
   initial: 'name-1',
   value: 'name-1'
   },
   address: {
   street: {
   initial: 'street-1',
   value: 'street-1'
   },
   postalCode: {
   initial: 'postalCode-1',
   value: 'postalCode-1'
   }
   }
   },
   {
   name: {
   initial: 'name-2',
   value: 'name-2'
   },
   address: {
   street: {
   initial: 'street-2',
   value: 'street-2'
   },
   postalCode: {
   initial: 'postalCode-2',
   value: 'postalCode-2'
   }
   }
   },
   {
   name: {
   initial: 'name-3',
   value: 'name-3'
   },
   address: {
   street: {
   initial: 'street-3',
   value: 'street-3'
   },
   postalCode: {
   initial: 'postalCode-3',
   value: 'postalCode-3'
   }
   }
   }
   ],
   _active: undefined,
   _asyncValidating: false,
   _error: undefined,
   _initialized: false,
   _submitting: false,
   _submitFailed: false
   });
   });
   */

  it('should push a deep array value which is a nested object', () => {
    const state = reducer(
      {
        testForm: {
          _active: undefined,
          _asyncValidating: false,
          _error: undefined,
          _initialized: false,
          _submitFailed: false,
          _submitting: false,
          myField: [
            {
              bar: makeFieldValue({
                initial: {a: 'bar-a1', b: 'bar-b1'},
                value: {a: 'bar-a1', b: 'bar-b1'},
              }),
              foo: makeFieldValue({
                initial: {a: 'foo-a1', b: 'foo-b1'},
                value: {a: 'foo-a1', b: 'foo-b1'},
              }),
            },
            {
              bar: makeFieldValue({
                initial: {a: 'bar-a2', b: 'bar-b2'},
                value: {a: 'bar-a2', b: 'bar-b2'},
              }),
              foo: makeFieldValue({
                initial: {a: 'foo-a2', b: 'foo-b2'},
                value: {a: 'foo-a2', b: 'foo-b2'},
              }),
            },
          ],
        },
      },
      {
        ...addArrayValue(
          'myField',
          {
            bar: {a: 'bar-a3', b: 'bar-b3'},
            foo: {a: 'foo-a3', b: 'foo-b3'},
          },
          undefined,
        ),
        form: 'testForm',
      },
    )
    expect(state.testForm).toEqual({
      _active: undefined,
      _asyncValidating: false,
      _error: undefined,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      myField: [
        {
          bar: {
            initial: {a: 'bar-a1', b: 'bar-b1'},
            value: {a: 'bar-a1', b: 'bar-b1'},
          },
          foo: {
            initial: {a: 'foo-a1', b: 'foo-b1'},
            value: {a: 'foo-a1', b: 'foo-b1'},
          },
        },
        {
          bar: {
            initial: {a: 'bar-a2', b: 'bar-b2'},
            value: {a: 'bar-a2', b: 'bar-b2'},
          },
          foo: {
            initial: {a: 'foo-a2', b: 'foo-b2'},
            value: {a: 'foo-a2', b: 'foo-b2'},
          },
        },
        {
          bar: {
            initial: {a: 'bar-a3', b: 'bar-b3'},
            value: {a: 'bar-a3', b: 'bar-b3'},
          },
          foo: {
            initial: {a: 'foo-a3', b: 'foo-b3'},
            value: {a: 'foo-a3', b: 'foo-b3'},
          },
        },
      ],
    })
    expect(isFieldValue(state.testForm.myField)).toBe(false)
    expect(isFieldValue(state.testForm.myField[0])).toBe(false)
    expect(isFieldValue(state.testForm.myField[0].foo)).toBe(true)
    expect(isFieldValue(state.testForm.myField[0].bar)).toBe(true)
    expect(isFieldValue(state.testForm.myField[1])).toBe(false)
    expect(isFieldValue(state.testForm.myField[1].foo)).toBe(true)
    expect(isFieldValue(state.testForm.myField[1].bar)).toBe(true)
    expect(isFieldValue(state.testForm.myField[2])).toBe(false)
    expect(isFieldValue(state.testForm.myField[2].foo)).toBe(true)
    expect(isFieldValue(state.testForm.myField[2].bar)).toBe(true)
  })

  it('should push a subarray value which is an object', () => {
    const state = reducer(
      {
        testForm: {
          _active: undefined,
          _asyncValidating: false,
          _error: undefined,
          _initialized: false,
          _submitFailed: false,
          _submitting: false,
          myField: [
            {
              myField2: [
                {
                  bar: makeFieldValue({
                    initial: 'bar-1-1',
                    value: 'bar-1-1',
                  }),
                  foo: makeFieldValue({
                    initial: 'foo-1-1',
                    value: 'foo-1-1',
                  }),
                },
                {
                  bar: makeFieldValue({
                    initial: 'bar-1-2',
                    value: 'bar-1-2',
                  }),
                  foo: makeFieldValue({
                    initial: 'foo-1-2',
                    value: 'foo-1-2',
                  }),
                },
              ],
            },
            {
              myField2: [
                {
                  bar: makeFieldValue({
                    initial: 'bar-2-1',
                    value: 'bar-2-1',
                  }),
                  foo: makeFieldValue({
                    initial: 'foo-2-1',
                    value: 'foo-2-1',
                  }),
                },
                {
                  bar: makeFieldValue({
                    initial: 'bar-2-2',
                    value: 'bar-2-2',
                  }),
                  foo: makeFieldValue({
                    initial: 'foo-2-2',
                    value: 'foo-2-2',
                  }),
                },
              ],
            },
          ],
        },
      },
      {
        ...addArrayValue('myField[1].myField2', {bar: 'bar-2-3', foo: 'foo-2-3'}, undefined),
        form: 'testForm',
      },
    )
    expect(state.testForm).toEqual({
      _active: undefined,
      _asyncValidating: false,
      _error: undefined,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      myField: [
        {
          myField2: [
            {
              bar: {
                initial: 'bar-1-1',
                value: 'bar-1-1',
              },
              foo: {
                initial: 'foo-1-1',
                value: 'foo-1-1',
              },
            },
            {
              bar: {
                initial: 'bar-1-2',
                value: 'bar-1-2',
              },
              foo: {
                initial: 'foo-1-2',
                value: 'foo-1-2',
              },
            },
          ],
        },
        {
          myField2: [
            {
              bar: {
                initial: 'bar-2-1',
                value: 'bar-2-1',
              },
              foo: {
                initial: 'foo-2-1',
                value: 'foo-2-1',
              },
            },
            {
              bar: {
                initial: 'bar-2-2',
                value: 'bar-2-2',
              },
              foo: {
                initial: 'foo-2-2',
                value: 'foo-2-2',
              },
            },
            {
              bar: {
                initial: 'bar-2-3',
                value: 'bar-2-3',
              },
              foo: {
                initial: 'foo-2-3',
                value: 'foo-2-3',
              },
            },
          ],
        },
      ],
    })
    expect(isFieldValue(state.testForm.myField)).toBe(false)
    expect(isFieldValue(state.testForm.myField[0])).toBe(false)
    expect(isFieldValue(state.testForm.myField[0].myField2)).toBe(false)
    expect(isFieldValue(state.testForm.myField[0].myField2[0])).toBe(false)
    expect(isFieldValue(state.testForm.myField[0].myField2[0].foo)).toBe(true)
    expect(isFieldValue(state.testForm.myField[0].myField2[0].bar)).toBe(true)
    expect(isFieldValue(state.testForm.myField[0].myField2[1])).toBe(false)
    expect(isFieldValue(state.testForm.myField[0].myField2[1].foo)).toBe(true)
    expect(isFieldValue(state.testForm.myField[0].myField2[1].bar)).toBe(true)
    expect(isFieldValue(state.testForm.myField[1])).toBe(false)
    expect(isFieldValue(state.testForm.myField[1].myField2)).toBe(false)
    expect(isFieldValue(state.testForm.myField[1].myField2[0])).toBe(false)
    expect(isFieldValue(state.testForm.myField[1].myField2[0].foo)).toBe(true)
    expect(isFieldValue(state.testForm.myField[1].myField2[0].bar)).toBe(true)
    expect(isFieldValue(state.testForm.myField[1].myField2[1])).toBe(false)
    expect(isFieldValue(state.testForm.myField[1].myField2[1].foo)).toBe(true)
    expect(isFieldValue(state.testForm.myField[1].myField2[1].bar)).toBe(true)
    expect(isFieldValue(state.testForm.myField[1].myField2[2])).toBe(false)
    expect(isFieldValue(state.testForm.myField[1].myField2[2].foo)).toBe(true)
    expect(isFieldValue(state.testForm.myField[1].myField2[2].bar)).toBe(true)
  })

  it('should set value on blur with empty state', () => {
    const state = reducer(
      {},
      {
        ...blur('myField', 'myValue'),
        form: 'foo',
      },
    )
    expect(state.foo).toEqual({
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      [globalErrorKey]: undefined,
      myField: {
        value: 'myValue',
      },
    })
    expect(isFieldValue(state.foo.myField)).toBe(true)
  })

  it('should set value on blur and touch with empty state', () => {
    const state = reducer(
      {},
      {
        ...blur('myField', 'myValue'),
        form: 'foo',
        touch: true,
      },
    )
    expect(state.foo).toEqual({
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      [globalErrorKey]: undefined,
      myField: {
        touched: true,
        value: 'myValue',
      },
    })
    expect(isFieldValue(state.foo.myField)).toBe(true)
  })

  it('should set value on blur and touch with initial value', () => {
    const state = reducer(
      {
        foo: {
          _asyncValidating: false,
          _initialized: false,
          _submitFailed: false,
          _submitting: false,
          [globalErrorKey]: undefined,
          myField: makeFieldValue({
            initial: 'initialValue',
            touched: false,
            value: 'initialValue',
          }),
        },
      },
      {
        ...blur('myField', 'myValue'),
        form: 'foo',
        touch: true,
      },
    )
    expect(state.foo).toEqual({
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      [globalErrorKey]: undefined,
      myField: {
        initial: 'initialValue',
        touched: true,
        value: 'myValue',
      },
    })
    expect(isFieldValue(state.foo.myField)).toBe(true)
  })

  it('should not modify value if undefined is passed on blur (for android react native)', () => {
    const state = reducer(
      {
        foo: {
          _active: 'myField',
          _asyncValidating: false,
          _initialized: false,
          _submitFailed: false,
          _submitting: false,
          [globalErrorKey]: undefined,
          myField: makeFieldValue({
            initial: 'initialValue',
            touched: false,
            value: 'myValue',
          }),
        },
      },
      {
        ...blur('myField'),
        form: 'foo',
        touch: true,
      },
    )
    expect(state.foo).toEqual({
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      [globalErrorKey]: undefined,
      myField: {
        initial: 'initialValue',
        touched: true,
        value: 'myValue',
      },
    })
    expect(isFieldValue(state.foo.myField)).toBe(true)
  })

  it('should not modify value if undefined is passed on blur, even if no value existed (for android react native)', () => {
    const state = reducer(
      {
        foo: {
          _active: 'myField',
          _asyncValidating: false,
          _initialized: false,
          _submitFailed: false,
          _submitting: false,
          [globalErrorKey]: undefined,
          myField: makeFieldValue({
            value: undefined,
          }),
        },
      },
      {
        ...blur('myField'),
        form: 'foo',
        touch: true,
      },
    )
    expect(state.foo).toEqual({
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      [globalErrorKey]: undefined,
      myField: {
        touched: true,
        value: undefined,
      },
    })
    expect(isFieldValue(state.foo.myField)).toBe(true)
  })

  it('should set nested value on blur', () => {
    const state = reducer(
      {
        foo: {
          _active: 'myField',
          _asyncValidating: false,
          _initialized: false,
          _submitFailed: false,
          _submitting: false,
          [globalErrorKey]: undefined,
          myField: {
            mySubField: makeFieldValue({
              value: undefined,
            }),
          },
        },
      },
      {
        ...blur('myField.mySubField', 'hello'),
        form: 'foo',
        touch: true,
      },
    )
    expect(state.foo).toEqual({
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      [globalErrorKey]: undefined,
      myField: {
        mySubField: {
          touched: true,
          value: 'hello',
        },
      },
    })
    expect(isFieldValue(state.foo.myField)).toBe(false)
    expect(isFieldValue(state.foo.myField.mySubField)).toBe(true)
  })

  it('should set array value on blur', () => {
    const state = reducer(
      {
        foo: {
          _active: 'myField',
          _asyncValidating: false,
          _initialized: false,
          _submitFailed: false,
          _submitting: false,
          [globalErrorKey]: undefined,
          myArray: [makeFieldValue({value: undefined})],
        },
      },
      {
        ...blur('myArray[0]', 'hello'),
        form: 'foo',
        touch: true,
      },
    )
    expect(state.foo).toEqual({
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      [globalErrorKey]: undefined,
      myArray: [
        {
          touched: true,
          value: 'hello',
        },
      ],
    })
    expect(isFieldValue(state.foo.myArray[0])).toBe(true)
  })

  it('should set value on change with empty state', () => {
    const state = reducer(
      {},
      {
        ...change('myField', 'myValue'),
        form: 'foo',
      },
    )
    expect(state.foo).toEqual({
      _active: undefined,
      // CHANGE doesn't touch _active
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      [globalErrorKey]: undefined,
      myField: {
        value: 'myValue',
      },
    })
    expect(isFieldValue(state.foo.myField)).toBe(true)
  })

  it('should set value on change and touch with empty state', () => {
    const state = reducer(
      {},
      {
        ...change('myField', 'myValue'),
        form: 'foo',
        touch: true,
      },
    )
    expect(state.foo).toEqual({
      _active: undefined,
      // CHANGE doesn't touch _active
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      [globalErrorKey]: undefined,
      myField: {
        touched: true,
        value: 'myValue',
      },
    })
    expect(isFieldValue(state.foo.myField)).toBe(true)
  })

  it('should set value on change and touch with initial value', () => {
    const state = reducer(
      {
        foo: {
          _active: 'myField',
          _asyncValidating: false,
          _initialized: false,
          _submitFailed: false,
          _submitting: false,
          [globalErrorKey]: 'Some global error',
          myField: makeFieldValue({
            initial: 'initialValue',
            touched: false,
            value: 'initialValue',
          }),
        },
      },
      {
        ...change('myField', 'myValue'),
        form: 'foo',
        touch: true,
      },
    )
    expect(state.foo).toEqual({
      _active: 'myField',
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      [globalErrorKey]: 'Some global error',
      myField: {
        initial: 'initialValue',
        touched: true,
        value: 'myValue',
      },
    })
    expect(isFieldValue(state.foo.myField)).toBe(true)
  })

  it('should set value on change and remove field-level submit and async errors', () => {
    const state = reducer(
      {
        foo: {
          _active: 'myField',
          _asyncValidating: false,
          _initialized: false,
          _submitFailed: false,
          _submitting: false,
          [globalErrorKey]: 'Some global error',
          myField: makeFieldValue({
            asyncError: 'async error',
            submitError: 'submit error',
            value: 'initial',
          }),
        },
      },
      {
        ...change('myField', 'different'),
        form: 'foo',
      },
    )
    expect(state.foo).toEqual({
      _active: 'myField',
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      [globalErrorKey]: 'Some global error',
      myField: {
        value: 'different',
      },
    })
    expect(isFieldValue(state.foo.myField)).toBe(true)
  })

  it('should set nested value on change with empty state', () => {
    const state = reducer(
      {},
      {
        ...change('myField.mySubField', 'myValue'),
        form: 'foo',
      },
    )
    expect(state.foo).toEqual({
      _active: undefined,
      // CHANGE doesn't touch _active
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      [globalErrorKey]: undefined,
      myField: {
        mySubField: {
          value: 'myValue',
        },
      },
    })
    expect(isFieldValue(state.foo.myField)).toBe(false)
    expect(isFieldValue(state.foo.myField.mySubField)).toBe(true)
  })

  it('should set visited on focus and update active with no previous state', () => {
    const state = reducer(
      {},
      {
        ...focus('myField'),
        form: 'foo',
      },
    )
    expect(state.foo).toEqual({
      _active: 'myField',
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      [globalErrorKey]: undefined,
      myField: {
        visited: true,
      },
    })
    expect(isFieldValue(state.foo.myField)).toBe(true)
  })

  it('should set visited on focus and update active on deep field with no previous state', () => {
    const state = reducer(
      {},
      {
        ...focus('myField.subField'),
        form: 'foo',
      },
    )
    expect(state.foo).toEqual({
      _active: 'myField.subField',
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      [globalErrorKey]: undefined,
      myField: {
        subField: {
          visited: true,
        },
      },
    })
    expect(isFieldValue(state.foo.myField)).toBe(false)
    expect(isFieldValue(state.foo.myField.subField)).toBe(true)
  })

  it('should set visited on focus and update current with previous state', () => {
    const state = reducer(
      {
        foo: {
          _active: 'otherField',
          _asyncValidating: false,
          _initialized: false,
          _submitFailed: false,
          _submitting: false,
          [globalErrorKey]: undefined,
          myField: makeFieldValue({
            initial: 'initialValue',
            value: 'initialValue',
            visited: false,
          }),
        },
      },
      {
        ...focus('myField'),
        form: 'foo',
      },
    )
    expect(state.foo).toEqual({
      _active: 'myField',
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      [globalErrorKey]: undefined,
      myField: {
        initial: 'initialValue',
        value: 'initialValue',
        visited: true,
      },
    })
    expect(isFieldValue(state.foo.myField)).toBe(true)
  })

  it('should set initialize values on initialize on empty state', () => {
    const state = reducer(
      {},
      {
        ...initialize({myField: 'initialValue'}, ['myField']),
        form: 'foo',
      },
    )
    expect(state.foo).toEqual({
      _active: undefined,
      _asyncValidating: false,
      _initialized: true,
      _submitFailed: false,
      _submitting: false,
      [globalErrorKey]: undefined,
      myField: {
        initial: 'initialValue',
        value: 'initialValue',
      },
    })
    expect(isFieldValue(state.foo.myField)).toBe(true)
  })

  it('should allow initializing null values', () => {
    const state = reducer(
      {},
      {
        ...initialize({bar: 'baz', dog: null}, ['bar', 'dog']),
        form: 'foo',
      },
    )
    expect(state.foo).toEqual({
      _active: undefined,
      _asyncValidating: false,
      _initialized: true,
      _submitFailed: false,
      _submitting: false,
      bar: {
        initial: 'baz',
        value: 'baz',
      },
      dog: {
        initial: null,
        value: null,
      },
      [globalErrorKey]: undefined,
    })
    expect(isFieldValue(state.foo.bar)).toBe(true)
    expect(isFieldValue(state.foo.dog)).toBe(true)
  })

  it('should initialize nested values on initialize on empty state', () => {
    const state = reducer(
      {},
      {
        ...initialize({myField: {subField: 'initialValue'}}, ['myField.subField'], {}),
        form: 'foo',
      },
    )
    expect(state.foo).toEqual({
      _active: undefined,
      _asyncValidating: false,
      _initialized: true,
      _submitFailed: false,
      _submitting: false,
      [globalErrorKey]: undefined,
      myField: {
        subField: {
          initial: 'initialValue',
          value: 'initialValue',
        },
      },
    })
    expect(isFieldValue(state.foo.myField)).toBe(false)
    expect(isFieldValue(state.foo.myField.subField)).toBe(true)
  })

  it('should initialize array values on initialize on empty state', () => {
    const state = reducer(
      {},
      {
        ...initialize({myField: ['initialValue']}, ['myField[]'], {}),
        form: 'foo',
      },
    )
    expect(state.foo).toEqual({
      _active: undefined,
      _asyncValidating: false,
      _initialized: true,
      _submitFailed: false,
      _submitting: false,
      [globalErrorKey]: undefined,
      myField: [
        {
          initial: 'initialValue',
          value: 'initialValue',
        },
      ],
    })
    expect(isFieldValue(state.foo.myField)).toBe(false)
    expect(isFieldValue(state.foo.myField[0])).toBe(true)
  })

  it('should initialize array values with subvalues on initialize on empty state', () => {
    const state = reducer(
      {},
      {
        ...initialize(
          {
            accounts: [
              {
                email: 'bobby@gmail.com',
                name: 'Bobby Tables',
              },
              {
                email: 'sammy@gmail.com',
                name: 'Sammy Tables',
              },
            ],
          },
          ['accounts[].name', 'accounts[].email'],
          {},
        ),
        form: 'foo',
      },
    )
    expect(state.foo).toEqual({
      _active: undefined,
      _asyncValidating: false,
      _initialized: true,
      _submitFailed: false,
      _submitting: false,
      accounts: [
        {
          email: {
            initial: 'bobby@gmail.com',
            value: 'bobby@gmail.com',
          },
          name: {
            initial: 'Bobby Tables',
            value: 'Bobby Tables',
          },
        },
        {
          email: {
            initial: 'sammy@gmail.com',
            value: 'sammy@gmail.com',
          },
          name: {
            initial: 'Sammy Tables',
            value: 'Sammy Tables',
          },
        },
      ],
      [globalErrorKey]: undefined,
    })
    expect(isFieldValue(state.foo.accounts)).toBe(false)
    expect(isFieldValue(state.foo.accounts[0])).toBe(false)
    expect(isFieldValue(state.foo.accounts[0].name)).toBe(true)
    expect(isFieldValue(state.foo.accounts[0].email)).toBe(true)
    expect(isFieldValue(state.foo.accounts[1])).toBe(false)
    expect(isFieldValue(state.foo.accounts[1].name)).toBe(true)
    expect(isFieldValue(state.foo.accounts[1].email)).toBe(true)
  })

  it('should set initialize values, making form pristine when initializing', () => {
    const state = reducer(
      {
        foo: {
          _active: 'myField',
          _asyncValidating: false,
          _initialized: false,
          _submitFailed: false,
          _submitting: false,
          [globalErrorKey]: undefined,
          myField: makeFieldValue({
            touched: true,
            value: 'dirtyValue',
          }),
        },
      },
      {
        ...initialize({myField: 'cleanValue'}, ['myField']),
        form: 'foo',
        touch: true,
      },
    )
    expect(state.foo).toEqual({
      _active: undefined,
      _asyncValidating: false,
      _initialized: true,
      _submitFailed: false,
      _submitting: false,
      [globalErrorKey]: undefined,
      myField: {
        initial: 'cleanValue',
        value: 'cleanValue',
      },
    })
    expect(isFieldValue(state.foo.myField)).toBe(true)
  })

  it('should pop an array value', () => {
    const state = reducer(
      {
        testForm: {
          _active: undefined,
          _asyncValidating: false,
          _initialized: false,
          _submitFailed: false,
          _submitting: false,
          [globalErrorKey]: undefined,
          myField: [
            makeFieldValue({
              value: 'foo',
            }),
            makeFieldValue({
              value: 'bar',
            }),
          ],
        },
      },
      {
        ...removeArrayValue('myField'),
        form: 'testForm',
      },
    )
    expect(state.testForm).toEqual({
      _active: undefined,
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      [globalErrorKey]: undefined,
      myField: [
        {
          value: 'foo',
        },
      ],
    })
    expect(isFieldValue(state.testForm.myField)).toBe(false)
    expect(isFieldValue(state.testForm.myField[0])).toBe(true)
  })

  it('should not change empty array value on remove', () => {
    const state = reducer(
      {
        testForm: {
          _active: undefined,
          _asyncValidating: false,
          _initialized: false,
          _submitFailed: false,
          _submitting: false,
          [globalErrorKey]: undefined,
          myField: [],
        },
      },
      {
        ...removeArrayValue('myField'),
        form: 'testForm',
      },
    )
    expect(state.testForm).toEqual({
      _active: undefined,
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      [globalErrorKey]: undefined,
      myField: [],
    })
  })

  it('should remove an array value from start of array', () => {
    const state = reducer(
      {
        testForm: {
          _active: undefined,
          _asyncValidating: false,
          _initialized: false,
          _submitFailed: false,
          _submitting: false,
          [globalErrorKey]: undefined,
          myField: [
            makeFieldValue({
              value: 'foo',
            }),
            makeFieldValue({
              value: 'bar',
            }),
            makeFieldValue({
              value: 'baz',
            }),
          ],
        },
      },
      {
        ...removeArrayValue('myField', 0),
        form: 'testForm',
      },
    )
    expect(state.testForm).toEqual({
      _active: undefined,
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      [globalErrorKey]: undefined,
      myField: [
        {
          value: 'bar',
        },
        {
          value: 'baz',
        },
      ],
    })
    expect(isFieldValue(state.testForm.myField)).toBe(false)
    expect(isFieldValue(state.testForm.myField[0])).toBe(true)
    expect(isFieldValue(state.testForm.myField[1])).toBe(true)
  })

  it('should remove an array value from middle of array', () => {
    const state = reducer(
      {
        testForm: {
          _active: undefined,
          _asyncValidating: false,
          _initialized: false,
          _submitFailed: false,
          _submitting: false,
          [globalErrorKey]: undefined,
          myField: [
            makeFieldValue({
              value: 'foo',
            }),
            makeFieldValue({
              value: 'bar',
            }),
            makeFieldValue({
              value: 'baz',
            }),
          ],
        },
      },
      {
        ...removeArrayValue('myField', 1),
        form: 'testForm',
      },
    )
    expect(state.testForm).toEqual({
      _active: undefined,
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      [globalErrorKey]: undefined,
      myField: [
        {
          value: 'foo',
        },
        {
          value: 'baz',
        },
      ],
    })
    expect(isFieldValue(state.testForm.myField)).toBe(false)
    expect(isFieldValue(state.testForm.myField[0])).toBe(true)
    expect(isFieldValue(state.testForm.myField[1])).toBe(true)
  })

  it('should not change empty array value on swap', () => {
    const state = reducer(
      {
        testForm: {
          _active: undefined,
          _asyncValidating: false,
          _initialized: false,
          _submitFailed: false,
          _submitting: false,
          [globalErrorKey]: undefined,
          myField: [],
        },
      },
      {
        ...swapArrayValues('myField'),
        form: 'testForm',
      },
    )
    expect(state.testForm).toEqual({
      _active: undefined,
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      [globalErrorKey]: undefined,
      myField: [],
    })
  })

  it('should should swap two array values at different indexes', () => {
    const state = reducer(
      {
        testForm: {
          _active: undefined,
          _asyncValidating: false,
          _initialized: false,
          _submitFailed: false,
          _submitting: false,
          [globalErrorKey]: undefined,
          myField: [
            makeFieldValue({
              value: 'foo',
            }),
            makeFieldValue({
              value: 'bar',
            }),
            makeFieldValue({
              value: 'baz',
            }),
          ],
        },
      },
      {
        ...swapArrayValues('myField', 0, 2),
        form: 'testForm',
      },
    )
    expect(state.testForm).toEqual({
      _active: undefined,
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      [globalErrorKey]: undefined,
      myField: [
        {
          value: 'baz',
        },
        {
          value: 'bar',
        },
        {
          value: 'foo',
        },
      ],
    })
    expect(isFieldValue(state.testForm.myField)).toBe(false)
    expect(isFieldValue(state.testForm.myField[0])).toBe(true)
    expect(isFieldValue(state.testForm.myField[1])).toBe(true)
    expect(isFieldValue(state.testForm.myField[2])).toBe(true)
  })

  it('should not change array on swap with the same index', () => {
    const state = reducer(
      {
        testForm: {
          _active: undefined,
          _asyncValidating: false,
          _initialized: false,
          _submitFailed: false,
          _submitting: false,
          [globalErrorKey]: undefined,
          myField: [
            makeFieldValue({
              value: 'foo',
            }),
            makeFieldValue({
              value: 'bar',
            }),
            makeFieldValue({
              value: 'baz',
            }),
          ],
        },
      },
      {
        ...swapArrayValues('myField', 1, 1),
        form: 'testForm',
      },
    )
    expect(state.testForm).toEqual({
      _active: undefined,
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      [globalErrorKey]: undefined,
      myField: [
        {
          value: 'foo',
        },
        {
          value: 'bar',
        },
        {
          value: 'baz',
        },
      ],
    })
    expect(isFieldValue(state.testForm.myField)).toBe(false)
    expect(isFieldValue(state.testForm.myField[0])).toBe(true)
    expect(isFieldValue(state.testForm.myField[1])).toBe(true)
    expect(isFieldValue(state.testForm.myField[2])).toBe(true)
  })

  it('should not change array on swap with out of bounds index', () => {
    const state = reducer(
      {
        testForm: {
          _active: undefined,
          _asyncValidating: false,
          _initialized: false,
          _submitFailed: false,
          _submitting: false,
          [globalErrorKey]: undefined,
          myField: [
            makeFieldValue({
              value: 'foo',
            }),
            makeFieldValue({
              value: 'bar',
            }),
            makeFieldValue({
              value: 'baz',
            }),
          ],
        },
      },
      {
        ...swapArrayValues('myField', 1, 4),
        form: 'testForm',
      },
    )
    expect(state.testForm).toEqual({
      _active: undefined,
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      [globalErrorKey]: undefined,
      myField: [
        {
          value: 'foo',
        },
        {
          value: 'bar',
        },
        {
          value: 'baz',
        },
      ],
    })
    expect(isFieldValue(state.testForm.myField)).toBe(false)
    expect(isFieldValue(state.testForm.myField[0])).toBe(true)
    expect(isFieldValue(state.testForm.myField[1])).toBe(true)
    expect(isFieldValue(state.testForm.myField[2])).toBe(true)
  })

  it('should reset values on reset on with previous state', () => {
    const state = reducer(
      {
        foo: {
          _active: 'myField',
          _asyncValidating: false,
          _initialized: false,
          _submitFailed: false,
          _submitting: false,
          [globalErrorKey]: undefined,
          myField: makeFieldValue({
            initial: 'initialValue',
            touched: true,
            value: 'dirtyValue',
          }),
          myOtherField: makeFieldValue({
            initial: 'otherInitialValue',
            touched: true,
            value: 'otherDirtyValue',
          }),
        },
      },
      {
        ...reset(),
        form: 'foo',
      },
    )
    expect(state.foo).toEqual({
      _active: undefined,
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      [globalErrorKey]: undefined,
      myField: {
        initial: 'initialValue',
        value: 'initialValue',
      },
      myOtherField: {
        initial: 'otherInitialValue',
        value: 'otherInitialValue',
      },
    })
    expect(isFieldValue(state.foo.myField)).toBe(true)
    expect(isFieldValue(state.foo.myOtherField)).toBe(true)
  })

  it('should reset deep values on reset on with previous state', () => {
    const state = reducer(
      {
        foo: {
          _active: 'myField',
          _asyncValidating: false,
          _initialized: false,
          _submitFailed: false,
          _submitting: false,
          deepField: {
            myField: makeFieldValue({
              initial: 'initialValue',
              touched: true,
              value: 'dirtyValue',
            }),
            myOtherField: makeFieldValue({
              initial: 'otherInitialValue',
              touched: true,
              value: 'otherDirtyValue',
            }),
          },
          [globalErrorKey]: undefined,
        },
      },
      {
        ...reset(),
        form: 'foo',
      },
    )
    expect(state.foo).toEqual({
      _active: undefined,
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      deepField: {
        myField: {
          initial: 'initialValue',
          value: 'initialValue',
        },
        myOtherField: {
          initial: 'otherInitialValue',
          value: 'otherInitialValue',
        },
      },
      [globalErrorKey]: undefined,
    })
    expect(isFieldValue(state.foo.deepField)).toBe(false)
    expect(isFieldValue(state.foo.deepField.myField)).toBe(true)
    expect(isFieldValue(state.foo.deepField.myOtherField)).toBe(true)
  })

  it('should set asyncValidating on startAsyncValidation', () => {
    const state = reducer(
      {
        foo: {
          _active: undefined,
          _asyncValidating: false,
          _initialized: false,
          _submitFailed: false,
          _submitting: false,
          doesnt: 'matter',
          [globalErrorKey]: undefined,
          should: 'notchange',
        },
      },
      {
        ...startAsyncValidation(),
        form: 'foo',
      },
    )
    expect(state.foo).toEqual({
      _active: undefined,
      _asyncValidating: true,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      doesnt: 'matter',
      [globalErrorKey]: undefined,
      should: 'notchange',
    })
  })

  it('should set asyncValidating with field name on startAsyncValidation', () => {
    const state = reducer(
      {
        foo: {
          _active: undefined,
          _asyncValidating: false,
          _initialized: false,
          _submitFailed: false,
          _submitting: false,
          doesnt: 'matter',
          [globalErrorKey]: undefined,
          myField: makeFieldValue({
            initial: 'initialValue',
            value: 'initialValue',
          }),
          should: 'notchange',
        },
      },
      {
        ...startAsyncValidation('myField'),
        form: 'foo',
      },
    )
    expect(state.foo).toEqual({
      _active: undefined,
      _asyncValidating: 'myField',
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      doesnt: 'matter',
      [globalErrorKey]: undefined,
      myField: {
        initial: 'initialValue',
        value: 'initialValue',
      },
      should: 'notchange',
    })
    expect(isFieldValue(state.foo.myField)).toBe(true)
  })

  it('should set submitting on startSubmit', () => {
    const state = reducer(
      {
        foo: {
          _active: undefined,
          _asyncValidating: false,
          _initialized: false,
          _submitFailed: false,
          _submitting: false,
          doesnt: 'matter',
          [globalErrorKey]: undefined,
          should: 'notchange',
        },
      },
      {
        ...startSubmit(),
        form: 'foo',
      },
    )
    expect(state.foo).toEqual({
      _active: undefined,
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: false,
      _submitting: true,
      doesnt: 'matter',
      [globalErrorKey]: undefined,
      should: 'notchange',
    })
  })

  it('should set submitting on startSubmit, and NOT reset submitFailed', () => {
    const state = reducer(
      {
        foo: {
          _active: undefined,
          _asyncValidating: false,
          _initialized: false,
          _submitFailed: true,
          _submitting: false,
          doesnt: 'matter',
          [globalErrorKey]: undefined,
          should: 'notchange',
        },
      },
      {
        ...startSubmit(),
        form: 'foo',
      },
    )
    expect(state.foo).toEqual({
      _active: undefined,
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: true,
      _submitting: true,
      doesnt: 'matter',
      [globalErrorKey]: undefined,
      should: 'notchange',
    })
  })

  it('should set asyncError on nested fields on stopAsyncValidation', () => {
    const state = reducer(
      {
        foo: {
          _active: undefined,
          _asyncValidating: true,
          _initialized: false,
          _submitFailed: false,
          _submitting: false,
          bar: {
            myField: makeFieldValue({
              initial: 'initialValue',
              touched: true,
              value: 'dirtyValue',
            }),
            myOtherField: makeFieldValue({
              initial: 'otherInitialValue',
              touched: true,
              value: 'otherDirtyValue',
            }),
          },
          [globalErrorKey]: undefined,
        },
      },
      {
        ...stopAsyncValidation({
          bar: {
            myField: 'Error about myField',
            myOtherField: 'Error about myOtherField',
          },
        }),
        form: 'foo',
      },
    )
    expect(state.foo).toEqual({
      _active: undefined,
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      bar: {
        myField: {
          asyncError: 'Error about myField',
          initial: 'initialValue',
          touched: true,
          value: 'dirtyValue',
        },
        myOtherField: {
          asyncError: 'Error about myOtherField',
          initial: 'otherInitialValue',
          touched: true,
          value: 'otherDirtyValue',
        },
      },
      [globalErrorKey]: undefined,
    })
    expect(isFieldValue(state.foo.bar)).toBe(false)
    expect(isFieldValue(state.foo.bar.myField)).toBe(true)
    expect(isFieldValue(state.foo.bar.myOtherField)).toBe(true)
  })

  it('should set asyncError on array fields on stopAsyncValidation', () => {
    const state = reducer(
      {
        foo: {
          _active: undefined,
          _asyncValidating: true,
          _initialized: false,
          _submitFailed: false,
          _submitting: false,
          bar: [
            makeFieldValue({
              initial: 'initialValue',
              touched: true,
              value: 'dirtyValue',
            }),
            makeFieldValue({
              initial: 'otherInitialValue',
              touched: true,
              value: 'otherDirtyValue',
            }),
          ],
          [globalErrorKey]: undefined,
        },
      },
      {
        ...stopAsyncValidation({
          bar: ['Error about myField', 'Error about myOtherField'],
        }),
        form: 'foo',
      },
    )
    expect(state.foo).toEqual({
      _active: undefined,
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      bar: [
        {
          asyncError: 'Error about myField',
          initial: 'initialValue',
          touched: true,
          value: 'dirtyValue',
        },
        {
          asyncError: 'Error about myOtherField',
          initial: 'otherInitialValue',
          touched: true,
          value: 'otherDirtyValue',
        },
      ],
      [globalErrorKey]: undefined,
    })
    expect(isFieldValue(state.foo.bar)).toBe(false)
    expect(isFieldValue(state.foo.bar[0])).toBe(true)
    expect(isFieldValue(state.foo.bar[1])).toBe(true)
  })

  it('should unset asyncValidating on stopAsyncValidation', () => {
    const state = reducer(
      {
        foo: {
          _active: undefined,
          _asyncValidating: true,
          _initialized: false,
          _submitFailed: false,
          _submitting: false,
          [globalErrorKey]: undefined,
          myField: makeFieldValue({
            initial: 'initialValue',
            touched: true,
            value: 'dirtyValue',
          }),
          myOtherField: makeFieldValue({
            initial: 'otherInitialValue',
            touched: true,
            value: 'otherDirtyValue',
          }),
        },
      },
      {
        ...stopAsyncValidation({
          myField: 'Error about myField',
          myOtherField: 'Error about myOtherField',
        }),
        form: 'foo',
      },
    )
    expect(state.foo).toEqual({
      _active: undefined,
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      [globalErrorKey]: undefined,
      myField: {
        asyncError: 'Error about myField',
        initial: 'initialValue',
        touched: true,
        value: 'dirtyValue',
      },
      myOtherField: {
        asyncError: 'Error about myOtherField',
        initial: 'otherInitialValue',
        touched: true,
        value: 'otherDirtyValue',
      },
    })
    expect(isFieldValue(state.foo.myField)).toBe(true)
    expect(isFieldValue(state.foo.myOtherField)).toBe(true)
  })

  it('should unset field async errors on stopAsyncValidation', () => {
    const state = reducer(
      {
        foo: {
          _active: undefined,
          _asyncValidating: true,
          _initialized: false,
          _submitFailed: false,
          _submitting: false,
          [globalErrorKey]: undefined,
          myField: makeFieldValue({
            asyncError: 'myFieldError',
            initial: 'initialValue',
            touched: true,
            value: 'dirtyValue',
          }),
          myOtherField: makeFieldValue({
            asyncError: 'myOtherFieldError',
            initial: 'otherInitialValue',
            touched: true,
            value: 'otherDirtyValue',
          }),
        },
      },
      {
        ...stopAsyncValidation(),
        form: 'foo',
      },
    )
    expect(state.foo).toEqual({
      _active: undefined,
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      [globalErrorKey]: undefined,
      myField: {
        initial: 'initialValue',
        touched: true,
        value: 'dirtyValue',
      },
      myOtherField: {
        initial: 'otherInitialValue',
        touched: true,
        value: 'otherDirtyValue',
      },
    })
    expect(isFieldValue(state.foo.myField)).toBe(true)
    expect(isFieldValue(state.foo.myOtherField)).toBe(true)
  })

  it('should unset asyncValidating on stopAsyncValidation and set global error', () => {
    const state = reducer(
      {
        foo: {
          _active: undefined,
          _asyncValidating: true,
          _initialized: false,
          _submitFailed: false,
          _submitting: false,
          [globalErrorKey]: undefined,
          myField: makeFieldValue({
            initial: 'initialValue',
            touched: true,
            value: 'dirtyValue',
          }),
          myOtherField: makeFieldValue({
            initial: 'otherInitialValue',
            touched: true,
            value: 'otherDirtyValue',
          }),
        },
      },
      {
        ...stopAsyncValidation({
          [globalErrorKey]: 'This is a global error',
        }),
        form: 'foo',
      },
    )
    expect(state.foo).toEqual({
      _active: undefined,
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      [globalErrorKey]: 'This is a global error',
      myField: {
        initial: 'initialValue',
        touched: true,
        value: 'dirtyValue',
      },
      myOtherField: {
        initial: 'otherInitialValue',
        touched: true,
        value: 'otherDirtyValue',
      },
    })
    expect(isFieldValue(state.foo.myField)).toBe(true)
    expect(isFieldValue(state.foo.myOtherField)).toBe(true)
  })

  it('should unset submitting on stopSubmit', () => {
    const state = reducer(
      {
        foo: {
          _active: undefined,
          _asyncValidating: false,
          _initialized: false,
          _submitFailed: false,
          _submitting: true,
          doesnt: 'matter',
          [globalErrorKey]: undefined,
          should: 'notchange',
        },
      },
      {
        ...stopSubmit(),
        form: 'foo',
      },
    )
    expect(state.foo).toEqual({
      _active: undefined,
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      doesnt: 'matter',
      [globalErrorKey]: undefined,
      should: 'notchange',
    })
  })

  it('should set submitError on nested fields on stopSubmit', () => {
    const state = reducer(
      {
        foo: {
          _active: undefined,
          _asyncValidating: false,
          _initialized: false,
          _submitFailed: false,
          _submitting: true,
          bar: {
            myField: makeFieldValue({
              initial: 'initialValue',
              touched: true,
              value: 'dirtyValue',
            }),
            myOtherField: makeFieldValue({
              initial: 'otherInitialValue',
              touched: true,
              value: 'otherDirtyValue',
            }),
          },
          [globalErrorKey]: undefined,
        },
      },
      {
        ...stopSubmit({
          bar: {
            myField: 'Error about myField',
            myOtherField: 'Error about myOtherField',
          },
        }),
        form: 'foo',
      },
    )
    expect(state.foo).toEqual({
      _active: undefined,
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: true,
      _submitting: false,
      bar: {
        myField: {
          initial: 'initialValue',
          submitError: 'Error about myField',
          touched: true,
          value: 'dirtyValue',
        },
        myOtherField: {
          initial: 'otherInitialValue',
          submitError: 'Error about myOtherField',
          touched: true,
          value: 'otherDirtyValue',
        },
      },
      [globalErrorKey]: undefined,
    })
    expect(isFieldValue(state.foo.bar)).toBe(false)
    expect(isFieldValue(state.foo.bar.myField)).toBe(true)
    expect(isFieldValue(state.foo.bar.myOtherField)).toBe(true)
  })

  it('should set submitError on array fields on stopSubmit', () => {
    const state = reducer(
      {
        foo: {
          _active: undefined,
          _asyncValidating: false,
          _initialized: false,
          _submitFailed: false,
          _submitting: true,
          bar: [
            makeFieldValue({
              initial: 'initialValue',
              touched: true,
              value: 'dirtyValue',
            }),
            makeFieldValue({
              initial: 'otherInitialValue',
              touched: true,
              value: 'otherDirtyValue',
            }),
          ],
          [globalErrorKey]: undefined,
        },
      },
      {
        ...stopSubmit({
          bar: ['Error about myField', 'Error about myOtherField'],
        }),
        form: 'foo',
      },
    )
    expect(state.foo).toEqual({
      _active: undefined,
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: true,
      _submitting: false,
      bar: [
        {
          initial: 'initialValue',
          submitError: 'Error about myField',
          touched: true,
          value: 'dirtyValue',
        },
        {
          initial: 'otherInitialValue',
          submitError: 'Error about myOtherField',
          touched: true,
          value: 'otherDirtyValue',
        },
      ],
      [globalErrorKey]: undefined,
    })
    expect(isFieldValue(state.foo.bar)).toBe(false)
    expect(isFieldValue(state.foo.bar[0])).toBe(true)
    expect(isFieldValue(state.foo.bar[1])).toBe(true)
  })

  it('should unset submitFailed on stopSubmit with no errors', () => {
    const state = reducer(
      {
        foo: {
          _active: undefined,
          _asyncValidating: false,
          _initialized: false,
          _submitFailed: true,
          _submitting: true,
          doesnt: 'matter',
          [globalErrorKey]: undefined,
          should: 'notchange',
        },
      },
      {
        ...stopSubmit(),
        form: 'foo',
      },
    )
    expect(state.foo).toEqual({
      _active: undefined,
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      doesnt: 'matter',
      [globalErrorKey]: undefined,
      should: 'notchange',
    })
  })

  it('should unset submitting and set submit errors on stopSubmit', () => {
    const state = reducer(
      {
        foo: {
          _active: undefined,
          _asyncValidating: false,
          _initialized: false,
          _submitFailed: false,
          _submitting: true,
          [globalErrorKey]: undefined,
          myField: makeFieldValue({
            initial: 'initialValue',
            touched: true,
            value: 'dirtyValue',
          }),
          myOtherField: makeFieldValue({
            initial: 'otherInitialValue',
            touched: true,
            value: 'otherDirtyValue',
          }),
        },
      },
      {
        ...stopSubmit({
          myField: 'Error about myField',
          myOtherField: 'Error about myOtherField',
        }),
        form: 'foo',
      },
    )
    expect(state.foo).toEqual({
      _active: undefined,
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: true,
      _submitting: false,
      [globalErrorKey]: undefined,
      myField: {
        initial: 'initialValue',
        submitError: 'Error about myField',
        touched: true,
        value: 'dirtyValue',
      },
      myOtherField: {
        initial: 'otherInitialValue',
        submitError: 'Error about myOtherField',
        touched: true,
        value: 'otherDirtyValue',
      },
    })
    expect(isFieldValue(state.foo.myField)).toBe(true)
    expect(isFieldValue(state.foo.myOtherField)).toBe(true)
  })

  it('should unset submitting and set submit global error on stopSubmit', () => {
    const state = reducer(
      {
        foo: {
          _active: undefined,
          _asyncValidating: false,
          _initialized: false,
          _submitFailed: false,
          _submitting: true,
          [globalErrorKey]: undefined,
          myField: makeFieldValue({
            initial: 'initialValue',
            touched: true,
            value: 'dirtyValue',
          }),
          myOtherField: makeFieldValue({
            initial: 'otherInitialValue',
            touched: true,
            value: 'otherDirtyValue',
          }),
        },
      },
      {
        ...stopSubmit({
          [globalErrorKey]: 'This is a global error',
        }),
        form: 'foo',
      },
    )
    expect(state.foo).toEqual({
      _active: undefined,
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: true,
      _submitting: false,
      [globalErrorKey]: 'This is a global error',
      myField: {
        initial: 'initialValue',
        touched: true,
        value: 'dirtyValue',
      },
      myOtherField: {
        initial: 'otherInitialValue',
        touched: true,
        value: 'otherDirtyValue',
      },
    })
    expect(isFieldValue(state.foo.myField)).toBe(true)
    expect(isFieldValue(state.foo.myOtherField)).toBe(true)
  })

  it('should mark fields as touched on touch', () => {
    const state = reducer(
      {
        foo: {
          _active: undefined,
          _asyncValidating: false,
          _initialized: false,
          _submitFailed: false,
          _submitting: false,
          [globalErrorKey]: undefined,
          myField: makeFieldValue({
            touched: false,
            value: 'initialValue',
          }),
          myOtherField: makeFieldValue({
            touched: false,
            value: 'otherInitialValue',
          }),
        },
      },
      {
        ...touch('myField', 'myOtherField'),
        form: 'foo',
      },
    )
    expect(state.foo).toEqual({
      _active: undefined,
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      [globalErrorKey]: undefined,
      myField: {
        touched: true,
        value: 'initialValue',
      },
      myOtherField: {
        touched: true,
        value: 'otherInitialValue',
      },
    })
    expect(isFieldValue(state.foo.myField)).toBe(true)
    expect(isFieldValue(state.foo.myOtherField)).toBe(true)
  })

  it('should mark deep fields as touched on touch', () => {
    const state = reducer(
      {
        foo: {
          _active: undefined,
          _asyncValidating: false,
          _initialized: false,
          _submitFailed: false,
          _submitting: false,
          deep: {
            myField: makeFieldValue({
              touched: false,
              value: 'initialValue',
            }),
            myOtherField: makeFieldValue({
              touched: false,
              value: 'otherInitialValue',
            }),
          },
          [globalErrorKey]: undefined,
        },
      },
      {
        ...touch('deep.myField', 'deep.myOtherField'),
        form: 'foo',
      },
    )
    expect(state.foo).toEqual({
      _active: undefined,
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      deep: {
        myField: {
          touched: true,
          value: 'initialValue',
        },
        myOtherField: {
          touched: true,
          value: 'otherInitialValue',
        },
      },
      [globalErrorKey]: undefined,
    })
    expect(isFieldValue(state.foo.deep)).toBe(false)
    expect(isFieldValue(state.foo.deep.myField)).toBe(true)
    expect(isFieldValue(state.foo.deep.myOtherField)).toBe(true)
  })

  it('should mark array fields as touched on touch', () => {
    const state = reducer(
      {
        foo: {
          _active: undefined,
          _asyncValidating: false,
          _initialized: false,
          _submitFailed: false,
          _submitting: false,
          [globalErrorKey]: undefined,
          myFields: [
            makeFieldValue({
              touched: false,
              value: 'initialValue',
            }),
            makeFieldValue({
              touched: false,
              value: 'otherInitialValue',
            }),
          ],
        },
      },
      {
        ...touch('myFields[0]', 'myFields[1]'),
        form: 'foo',
      },
    )
    expect(state.foo).toEqual({
      _active: undefined,
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      [globalErrorKey]: undefined,
      myFields: [
        {
          touched: true,
          value: 'initialValue',
        },
        {
          touched: true,
          value: 'otherInitialValue',
        },
      ],
    })
    expect(isFieldValue(state.foo.myFields)).toBe(false)
    expect(isFieldValue(state.foo.myFields[0])).toBe(true)
    expect(isFieldValue(state.foo.myFields[1])).toBe(true)
  })

  it('should mark index-less array fields as touched on touch', () => {
    const state = reducer(
      {
        foo: {
          _active: undefined,
          _asyncValidating: false,
          _initialized: false,
          _submitFailed: false,
          _submitting: false,
          [globalErrorKey]: undefined,
          myFields: [
            makeFieldValue({
              touched: false,
              value: 'initialValue',
            }),
            makeFieldValue({
              touched: false,
              value: 'otherInitialValue',
            }),
          ],
        },
      },
      {
        ...touch('myFields[]'),
        form: 'foo',
      },
    )
    expect(state.foo).toEqual({
      _active: undefined,
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      [globalErrorKey]: undefined,
      myFields: [
        {
          touched: true,
          value: 'initialValue',
        },
        {
          touched: true,
          value: 'otherInitialValue',
        },
      ],
    })
    expect(isFieldValue(state.foo.myFields)).toBe(false)
    expect(isFieldValue(state.foo.myFields[0])).toBe(true)
    expect(isFieldValue(state.foo.myFields[1])).toBe(true)
  })

  it('should mark index-less array subfields as touched on touch', () => {
    const state = reducer(
      {
        foo: {
          _active: undefined,
          _asyncValidating: false,
          _initialized: false,
          _submitFailed: false,
          _submitting: false,
          [globalErrorKey]: undefined,
          myFields: [
            {
              name: makeFieldValue({
                touched: false,
                value: 'initialValue',
              }),
            },
            {
              name: makeFieldValue({
                touched: false,
                value: 'otherInitialValue',
              }),
            },
          ],
        },
      },
      {
        ...touch('myFields[].name'),
        form: 'foo',
      },
    )
    expect(state.foo).toEqual({
      _active: undefined,
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      [globalErrorKey]: undefined,
      myFields: [
        {
          name: {
            touched: true,
            value: 'initialValue',
          },
        },
        {
          name: {
            touched: true,
            value: 'otherInitialValue',
          },
        },
      ],
    })
    expect(isFieldValue(state.foo.myFields)).toBe(false)
    expect(isFieldValue(state.foo.myFields[0])).toBe(false)
    expect(isFieldValue(state.foo.myFields[0].name)).toBe(true)
    expect(isFieldValue(state.foo.myFields[1])).toBe(false)
    expect(isFieldValue(state.foo.myFields[1].name)).toBe(true)
  })

  it('should ignore empty index-less array fields on touch', () => {
    const state = reducer(
      {
        foo: {
          _active: undefined,
          _asyncValidating: false,
          _initialized: false,
          _submitFailed: false,
          _submitting: false,
          [globalErrorKey]: undefined,
        },
      },
      {
        ...touch('myFields[]'),
        form: 'foo',
      },
    )
    expect(state.foo).toEqual({
      _active: undefined,
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      [globalErrorKey]: undefined,
    })
  })

  it('should ignore empty index-less array subfields on touch', () => {
    const state = reducer(
      {
        foo: {
          _active: undefined,
          _asyncValidating: false,
          _initialized: false,
          _submitFailed: false,
          _submitting: false,
          [globalErrorKey]: undefined,
        },
      },
      {
        ...touch('myFields[].name'),
        form: 'foo',
      },
    )
    expect(state.foo).toEqual({
      _active: undefined,
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      [globalErrorKey]: undefined,
    })
  })

  it('should unmark fields as touched on untouch', () => {
    const state = reducer(
      {
        foo: {
          _active: undefined,
          _asyncValidating: false,
          _initialized: false,
          _submitFailed: false,
          _submitting: false,
          [globalErrorKey]: undefined,
          myField: makeFieldValue({
            touched: true,
            value: 'initialValue',
          }),
          myOtherField: makeFieldValue({
            touched: true,
            value: 'otherInitialValue',
          }),
        },
      },
      {
        ...untouch('myField', 'myOtherField'),
        form: 'foo',
      },
    )
    expect(state.foo).toEqual({
      _active: undefined,
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      [globalErrorKey]: undefined,
      myField: {
        value: 'initialValue',
      },
      myOtherField: {
        value: 'otherInitialValue',
      },
    })
    expect(isFieldValue(state.foo.myField)).toBe(true)
    expect(isFieldValue(state.foo.myOtherField)).toBe(true)
  })

  it('should unmark deep fields as touched on untouch', () => {
    const state = reducer(
      {
        foo: {
          _active: undefined,
          _asyncValidating: false,
          _initialized: false,
          _submitFailed: false,
          _submitting: false,
          deep: {
            myField: makeFieldValue({
              touched: true,
              value: 'initialValue',
            }),
            myOtherField: makeFieldValue({
              touched: true,
              value: 'otherInitialValue',
            }),
          },
          [globalErrorKey]: undefined,
        },
      },
      {
        ...untouch('deep.myField', 'deep.myOtherField'),
        form: 'foo',
      },
    )
    expect(state.foo).toEqual({
      _active: undefined,
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      deep: {
        myField: {
          value: 'initialValue',
        },
        myOtherField: {
          value: 'otherInitialValue',
        },
      },
      [globalErrorKey]: undefined,
    })
    expect(isFieldValue(state.foo.deep)).toBe(false)
    expect(isFieldValue(state.foo.deep.myField)).toBe(true)
    expect(isFieldValue(state.foo.deep.myOtherField)).toBe(true)
  })

  it('should unmark array fields as touched on untouch', () => {
    const state = reducer(
      {
        foo: {
          _active: undefined,
          _asyncValidating: false,
          _initialized: false,
          _submitFailed: false,
          _submitting: false,
          [globalErrorKey]: undefined,
          myFields: [
            makeFieldValue({
              touched: true,
              value: 'initialValue',
            }),
            makeFieldValue({
              touched: true,
              value: 'otherInitialValue',
            }),
          ],
        },
      },
      {
        ...untouch('myFields[0]', 'myFields[1]'),
        form: 'foo',
      },
    )
    expect(state.foo).toEqual({
      _active: undefined,
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      [globalErrorKey]: undefined,
      myFields: [
        {
          value: 'initialValue',
        },
        {
          value: 'otherInitialValue',
        },
      ],
    })
    expect(isFieldValue(state.foo.myFields)).toBe(false)
    expect(isFieldValue(state.foo.myFields[0])).toBe(true)
    expect(isFieldValue(state.foo.myFields[1])).toBe(true)
  })

  it('should mark index-less array fields as touched on touch', () => {
    const state = reducer(
      {
        foo: {
          _active: undefined,
          _asyncValidating: false,
          _initialized: false,
          _submitFailed: false,
          _submitting: false,
          [globalErrorKey]: undefined,
          myFields: [
            makeFieldValue({
              touched: true,
              value: 'initialValue',
            }),
            makeFieldValue({
              touched: true,
              value: 'otherInitialValue',
            }),
          ],
        },
      },
      {
        ...untouch('myFields[]'),
        form: 'foo',
      },
    )
    expect(state.foo).toEqual({
      _active: undefined,
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      [globalErrorKey]: undefined,
      myFields: [
        {
          value: 'initialValue',
        },
        {
          value: 'otherInitialValue',
        },
      ],
    })
    expect(isFieldValue(state.foo.myFields)).toBe(false)
    expect(isFieldValue(state.foo.myFields[0])).toBe(true)
    expect(isFieldValue(state.foo.myFields[1])).toBe(true)
  })

  it('should mark index-less array subfields as touched on touch', () => {
    const state = reducer(
      {
        foo: {
          _active: undefined,
          _asyncValidating: false,
          _initialized: false,
          _submitFailed: false,
          _submitting: false,
          [globalErrorKey]: undefined,
          myFields: [
            {
              name: makeFieldValue({
                touched: true,
                value: 'initialValue',
              }),
            },
            {
              name: makeFieldValue({
                touched: true,
                value: 'otherInitialValue',
              }),
            },
          ],
        },
      },
      {
        ...untouch('myFields[].name'),
        form: 'foo',
      },
    )
    expect(state.foo).toEqual({
      _active: undefined,
      _asyncValidating: false,
      _initialized: false,
      _submitFailed: false,
      _submitting: false,
      [globalErrorKey]: undefined,
      myFields: [
        {
          name: {
            value: 'initialValue',
          },
        },
        {
          name: {
            value: 'otherInitialValue',
          },
        },
      ],
    })
    expect(isFieldValue(state.foo.myFields)).toBe(false)
    expect(isFieldValue(state.foo.myFields[0])).toBe(false)
    expect(isFieldValue(state.foo.myFields[0].name)).toBe(true)
    expect(isFieldValue(state.foo.myFields[1])).toBe(false)
    expect(isFieldValue(state.foo.myFields[1].name)).toBe(true)
  })

  it('should destroy forms on destroy', () => {
    const state = reducer(
      {
        bar: {
          _active: undefined,
          _asyncValidating: false,
          _initialized: false,
          _submitFailed: false,
          _submitting: false,
          [globalErrorKey]: undefined,
        },
        foo: {
          _active: undefined,
          _asyncValidating: false,
          _initialized: false,
          _submitFailed: false,
          _submitting: false,
          [globalErrorKey]: undefined,
        },
      },
      {
        ...destroy(),
        form: 'foo',
      },
    )
    expect(state).toEqual({
      bar: {
        _active: undefined,
        _asyncValidating: false,
        _initialized: false,
        _submitFailed: false,
        _submitting: false,
        [globalErrorKey]: undefined,
      },
    })
  })

  it('should destroy last form on destroy', () => {
    const state = reducer(
      {
        foo: {
          _active: undefined,
          _asyncValidating: false,
          _initialized: false,
          _submitFailed: false,
          _submitting: false,
          [globalErrorKey]: undefined,
        },
      },
      {
        ...destroy(),
        form: 'foo',
      },
    )
    expect(state).toEqual({})
  })

  it('should destroy form and formkey on destroy', () => {
    const destroyWithKey = key => bindActionData(destroy, {key})()
    const state = reducer(
      {
        fooForm: {
          barKey: {
            _active: undefined,
            _asyncValidating: false,
            _initialized: false,
            _submitFailed: false,
            _submitting: false,
            [globalErrorKey]: undefined,
          },
          bazKey: {
            _active: undefined,
            _asyncValidating: false,
            _initialized: false,
            _submitFailed: false,
            _submitting: false,
            [globalErrorKey]: undefined,
          },
        },
      },
      {
        ...destroyWithKey('barKey'),
        form: 'fooForm',
      },
    )
    expect(state.fooForm).toEqual({
      bazKey: {
        _active: undefined,
        _asyncValidating: false,
        _initialized: false,
        _submitFailed: false,
        _submitting: false,
        [globalErrorKey]: undefined,
      },
    })
  })

  describe('reducer.plugin', () => {
    it('should initialize form state when there is a reducer plugin', () => {
      const result = reducer.plugin({
        foo: state => state,
      })()
      expect(result).toExist().toBeA('object')
      expect(Object.keys(result).length).toBe(1)
      expect(result.foo)
        .toExist()
        .toBeA('object')
        .toEqual({
          _active: undefined,
          _asyncValidating: false,
          _initialized: false,
          _submitFailed: false,
          _submitting: false,
          [globalErrorKey]: undefined,
        })
    })
  })

  describe('reducer.normalize', () => {
    it('should initialize form state when there is a normalizer', () => {
      const state = reducer.normalize({
        foo: {
          myField: () => 'normalized',
          'person.name': () => 'John Doe',
          'pets[].name': () => 'Fido',
        },
      })()
      expect(state).toExist().toBeA('object')
      expect(Object.keys(state).length).toBe(1)
      expect(state.foo)
        .toExist()
        .toBeA('object')
        .toEqual({
          _active: undefined,
          _asyncValidating: false,
          _initialized: false,
          _submitFailed: false,
          _submitting: false,
          [globalErrorKey]: undefined,
          myField: {
            value: 'normalized',
          },
          person: {
            name: {
              value: 'John Doe',
            },
          },
          pets: [],
        })
    })

    it('should normalize keyed forms depending on action form key', () => {
      const defaultFields = {
        _active: undefined,
        _asyncValidating: false,
        _initialized: false,
        _submitFailed: false,
        _submitting: false,
        [globalErrorKey]: undefined,
      }
      const normalize = reducer.normalize({
        foo: {
          myField: () => 'normalized',
          'person.name': () => 'John Doe',
          'pets[].name': () => 'Fido',
        },
      })
      const state = normalize(
        {
          foo: {
            firstSubform: {},
          },
        },
        {
          form: 'foo',
          key: 'firstSubform',
        },
      )
      const nextState = normalize(state, {
        form: 'foo',
        key: 'secondSubForm',
      })
      expect(state).toExist().toBeA('object')
      expect(Object.keys(state).length).toBe(1)
      expect(state.foo)
        .toExist()
        .toBeA('object')
        .toEqual({
          firstSubform: {
            ...defaultFields,
            myField: {
              value: 'normalized',
            },
            person: {
              name: {
                value: 'John Doe',
              },
            },
            pets: [],
          },
        })
      expect(nextState.foo).toEqual({
        firstSubform: {
          ...defaultFields,
          myField: {
            value: 'normalized',
          },
          person: {
            name: {
              value: 'John Doe',
            },
          },
          pets: [],
        },
        secondSubForm: {
          ...defaultFields,
          myField: {
            value: 'normalized',
          },
          person: {
            name: {
              value: 'John Doe',
            },
          },
          pets: [],
        },
      })
    })

    it('should normalize simple form values', () => {
      const defaultFields = {
        _active: undefined,
        _asyncValidating: false,
        _initialized: false,
        _submitFailed: false,
        _submitting: false,
        [globalErrorKey]: undefined,
      }
      const normalize = reducer.normalize({
        foo: {
          name: () => 'normalized',
          'person.name': name => name && name.toUpperCase(),
          'pets[].name': name => name && name.toLowerCase(),
        },
      })
      const state = normalize({
        foo: {
          name: {
            value: 'dog',
          },
          person: {
            name: {
              value: 'John Doe',
            },
          },
          pets: [{name: {value: 'Fido'}}, {name: {value: 'Tucker'}}],
        },
      })
      expect(state).toExist().toBeA('object')
      expect(state.foo)
        .toExist()
        .toBeA('object')
        .toEqual({
          ...defaultFields,
          name: {
            value: 'normalized',
          },
          person: {
            name: {
              value: 'JOHN DOE',
            },
          },
          pets: [{name: {value: 'fido'}}, {name: {value: 'tucker'}}],
        })
    })

    it('should allow resetForm to work on a normalized form', () => {
      const defaultFields = {
        _active: undefined,
        _asyncValidating: false,
        _initialized: false,
        _submitFailed: false,
        _submitting: false,
        [globalErrorKey]: undefined,
      }
      const normalizingReducer = reducer.normalize({
        foo: {
          name: value => value && value.toUpperCase(),
          'person.name': name => name && name.toUpperCase(),
          'pets[].name': name => name && name.toLowerCase(),
        },
      })
      const empty = normalizingReducer()
      let state = normalizingReducer(empty, {
        form: 'foo',
        ...change('name', 'dog'),
      })
      state = normalizingReducer(state, {
        form: 'foo',
        ...change('person.name', 'John Doe'),
      })
      state = normalizingReducer(state, {
        form: 'foo',
        ...addArrayValue('pets', {name: 'Fido'}),
      })
      expect(state).toExist().toBeA('object')
      expect(state.foo)
        .toExist()
        .toBeA('object')
        .toEqual({
          ...defaultFields,
          name: {
            value: 'DOG',
          },
          person: {
            name: {
              value: 'JOHN DOE',
            },
          },
          pets: [
            {
              name: {
                initial: 'Fido',
                value: 'fido',
              },
            },
          ],
        })
      const result = normalizingReducer(state, {
        form: 'foo',
        ...reset(),
      })
      expect(result).toExist().toBeA('object')
      expect(result.foo)
        .toExist()
        .toBeA('object')
        .toEqual({
          ...defaultFields,
          name: {
            value: undefined,
          },
          person: {
            name: {
              value: undefined,
            },
          },
          pets: [
            {
              name: {
                initial: 'Fido',
                value: 'fido',
              },
            },
          ],
        })
    })

    it('should normalize arbitrarily deeply nested fields', () => {
      const defaultFields = {
        _active: undefined,
        _asyncValidating: false,
        _initialized: false,
        _submitFailed: false,
        _submitting: false,
        [globalErrorKey]: undefined,
      }
      const normalize = reducer.normalize({
        foo: {
          'a.very.deep.object.property': value => value && value.toUpperCase(),
          'cats[]': array => array && array.map(({value}) => ({value: value.toUpperCase()})),
          'my[].deeply[].nested.item': value => value && value.toUpperCase(),
          name: () => 'normalized',
          'person.name': name => name && name.toUpperCase(),
          'pets[].name': name => name && name.toLowerCase(),
          'programming[].langs[]': array => array && array.slice(0).sort(compare),
          'some.numbers[]': array => array && array.filter(({value}) => value % 2 === 0),
        },
      })
      const state = normalize({
        foo: {
          a: {
            very: {
              deep: {
                object: {
                  property: makeFieldValue({value: 'test'}),
                },
              },
            },
          },
          cats: [
            makeFieldValue({value: 'lion'}),
            makeFieldValue({value: 'panther'}),
            makeFieldValue({value: 'garfield'}),
            makeFieldValue({value: 'whiskers'}),
          ],
          my: [
            {
              deeply: [
                {
                  nested: {
                    item: makeFieldValue({value: 'hello'}),
                    not: makeFieldValue({value: 'lost'}),
                  },
                  otherKey: makeFieldValue({value: 'Goodbye'}),
                },
                {
                  nested: {
                    item: makeFieldValue({value: 'hola'}),
                    not: makeFieldValue({value: 'lost'}),
                  },
                  otherKey: makeFieldValue({value: 'Adios'}),
                },
              ],
              stays: makeFieldValue({value: 'intact'}),
            },
            {
              deeply: [
                {
                  nested: {
                    item: makeFieldValue({value: 'world'}),
                    not: makeFieldValue({value: 'lost'}),
                  },
                  otherKey: makeFieldValue({value: 'Later'}),
                },
                {
                  nested: {
                    item: makeFieldValue({value: 'mundo'}),
                    not: makeFieldValue({value: 'lost'}),
                  },
                  otherKey: makeFieldValue({value: 'Hasta luego'}),
                },
              ],
              stays: makeFieldValue({value: 'intact'}),
            },
          ],
          person: {
            name: makeFieldValue({value: 'John Doe'}),
          },
          pets: [{name: makeFieldValue({value: 'Fido'})}, {name: makeFieldValue({value: 'Tucker'})}],
          programming: [
            {
              langs: [
                makeFieldValue({value: 'ml'}),
                makeFieldValue({value: 'ocaml'}),
                makeFieldValue({value: 'lisp'}),
                makeFieldValue({value: 'haskell'}),
                makeFieldValue({value: 'f#'}),
              ],
            },
            {
              langs: [
                makeFieldValue({value: 'smalltalk'}),
                makeFieldValue({value: 'ruby'}),
                makeFieldValue({value: 'java'}),
                makeFieldValue({value: 'c#'}),
                makeFieldValue({value: 'c++'}),
              ],
            },
          ],
          some: {
            numbers: [
              makeFieldValue({value: 1}),
              makeFieldValue({value: 2}),
              makeFieldValue({value: 3}),
              makeFieldValue({value: 4}),
              makeFieldValue({value: 5}),
              makeFieldValue({value: 6}),
              makeFieldValue({value: 7}),
              makeFieldValue({value: 8}),
              makeFieldValue({value: 9}),
              makeFieldValue({value: 10}),
            ],
          },
        },
      })
      expect(state).toExist().toBeA('object')
      expect(state.foo)
        .toExist()
        .toBeA('object')
        .toEqual({
          ...defaultFields,
          a: {
            very: {
              deep: {
                object: {
                  property: {value: 'TEST'},
                },
              },
            },
          },
          cats: [{value: 'LION'}, {value: 'PANTHER'}, {value: 'GARFIELD'}, {value: 'WHISKERS'}],
          my: [
            {
              deeply: [
                {
                  nested: {
                    item: {value: 'HELLO'},
                    not: {value: 'lost'},
                  },
                  otherKey: {value: 'Goodbye'},
                },
                {
                  nested: {
                    item: {value: 'HOLA'},
                    not: {value: 'lost'},
                  },
                  otherKey: {value: 'Adios'},
                },
              ],
              stays: {value: 'intact'},
            },
            {
              deeply: [
                {
                  nested: {
                    item: {value: 'WORLD'},
                    not: {value: 'lost'},
                  },
                  otherKey: {value: 'Later'},
                },
                {
                  nested: {
                    item: {value: 'MUNDO'},
                    not: {value: 'lost'},
                  },
                  otherKey: {value: 'Hasta luego'},
                },
              ],
              stays: {value: 'intact'},
            },
          ],
          name: {value: 'normalized'},
          person: {
            name: {value: 'JOHN DOE'},
          },
          pets: [{name: {value: 'fido'}}, {name: {value: 'tucker'}}],
          programming: [
            {
              langs: [{value: 'f#'}, {value: 'haskell'}, {value: 'lisp'}, {value: 'ml'}, {value: 'ocaml'}],
            },
            {
              langs: [{value: 'c#'}, {value: 'c++'}, {value: 'java'}, {value: 'ruby'}, {value: 'smalltalk'}],
            },
          ],
          some: {
            numbers: [{value: 2}, {value: 4}, {value: 6}, {value: 8}, {value: 10}],
          },
        })
      expect(isFieldValue(state.foo.name)).toBe(true)
      expect(isFieldValue(state.foo.person.name)).toBe(true)
      expect(isFieldValue(state.foo.pets[0].name)).toBe(true)
      expect(isFieldValue(state.foo.pets[1].name)).toBe(true)
      expect(isFieldValue(state.foo.cats[0])).toBe(true)
      expect(isFieldValue(state.foo.cats[1])).toBe(true)
      expect(isFieldValue(state.foo.cats[2])).toBe(true)
      expect(isFieldValue(state.foo.cats[3])).toBe(true)
      expect(isFieldValue(state.foo.programming[0].langs[0])).toBe(true)
      expect(isFieldValue(state.foo.programming[0].langs[1])).toBe(true)
      expect(isFieldValue(state.foo.programming[0].langs[2])).toBe(true)
      expect(isFieldValue(state.foo.programming[0].langs[3])).toBe(true)
      expect(isFieldValue(state.foo.programming[0].langs[4])).toBe(true)
      expect(isFieldValue(state.foo.programming[1].langs[0])).toBe(true)
      expect(isFieldValue(state.foo.programming[1].langs[1])).toBe(true)
      expect(isFieldValue(state.foo.programming[1].langs[2])).toBe(true)
      expect(isFieldValue(state.foo.programming[1].langs[3])).toBe(true)
      expect(isFieldValue(state.foo.programming[1].langs[4])).toBe(true)
      expect(isFieldValue(state.foo.some.numbers[0])).toBe(true)
      expect(isFieldValue(state.foo.some.numbers[1])).toBe(true)
      expect(isFieldValue(state.foo.some.numbers[2])).toBe(true)
      expect(isFieldValue(state.foo.some.numbers[3])).toBe(true)
      expect(isFieldValue(state.foo.some.numbers[4])).toBe(true)
      expect(isFieldValue(state.foo.a.very.deep.object.property)).toBe(true)
      expect(isFieldValue(state.foo.my[0].deeply[0].nested.item)).toBe(true)
      expect(isFieldValue(state.foo.my[0].deeply[0].nested.not)).toBe(true)
      expect(isFieldValue(state.foo.my[0].deeply[0].otherKey)).toBe(true)
      expect(isFieldValue(state.foo.my[0].deeply[1].nested.item)).toBe(true)
      expect(isFieldValue(state.foo.my[0].deeply[1].nested.not)).toBe(true)
      expect(isFieldValue(state.foo.my[0].deeply[1].otherKey)).toBe(true)
      expect(isFieldValue(state.foo.my[0].stays)).toBe(true)
      expect(isFieldValue(state.foo.my[1].deeply[0].nested.item)).toBe(true)
      expect(isFieldValue(state.foo.my[1].deeply[0].nested.not)).toBe(true)
      expect(isFieldValue(state.foo.my[1].deeply[0].otherKey)).toBe(true)
      expect(isFieldValue(state.foo.my[1].deeply[1].nested.item)).toBe(true)
      expect(isFieldValue(state.foo.my[1].deeply[1].nested.not)).toBe(true)
      expect(isFieldValue(state.foo.my[1].deeply[1].otherKey)).toBe(true)
      expect(isFieldValue(state.foo.my[1].stays)).toBe(true)
    })
  })
})
