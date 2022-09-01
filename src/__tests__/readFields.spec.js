import expect, {createSpy} from 'expect'

import readFields from '../readFields'

const createRestorableSpy = fn => {
  return createSpy(fn, function restore() {
    this.calls = []
  })
}

describe('readFields', () => {
  const blur = createRestorableSpy()
  const change = createRestorableSpy()
  const focus = createRestorableSpy()
  const noValidation = () => ({})

  const expectField = ({field, name, value, dirty, touched, visited, error, initialValue, readonly, checked}) => {
    expect(field).toExist().toBeA('object')
    expect(field.name).toBe(name)
    expect(field.value).toEqual(value)
    if (readonly) {
      expect(field.onBlur).toNotExist()
      expect(field.onChange).toNotExist()
      expect(field.onDragStart).toNotExist()
      expect(field.onDrop).toNotExist()
      expect(field.onFocus).toNotExist()
      expect(field.onUpdate).toNotExist()
    } else {
      expect(field.onBlur).toBeA('function')
      expect(field.onChange).toBeA('function')
      expect(field.onDragStart).toBeA('function')
      expect(field.onDrop).toBeA('function')
      expect(field.onFocus).toBeA('function')
      expect(field.onUpdate).toBeA('function')
      expect(field.onUpdate).toBe(field.onChange)

      // call blur
      expect(blur.calls.length).toBe(0)
      field.onBlur('newValue')
      expect(blur.calls.length).toBe(1)
      expect(blur).toHaveBeenCalled().toHaveBeenCalledWith(name, 'newValue')

      // call change
      expect(change.calls.length).toBe(0)
      field.onChange('newValue')
      expect(change.calls.length).toBe(1)
      expect(change).toHaveBeenCalled().toHaveBeenCalledWith(name, 'newValue')

      // call focus
      expect(focus.calls.length).toBe(0)
      field.onFocus()
      expect(focus.calls.length).toBe(1)
      expect(focus).toHaveBeenCalled()
    }
    expect(field.defaultChecked).toBe(initialValue === true)
    expect(field.defaultValue).toBe(initialValue)
    expect(field.error).toBe(error)
    expect(field.valid).toBe(!error)
    expect(field.invalid).toBe(!!error)
    expect(field.dirty).toBe(dirty)
    expect(field.pristine).toBe(!dirty)
    expect(field.touched).toBe(touched)
    expect(field.visited).toBe(visited)
    expect(field.checked).toBe(checked)

    blur.restore()
    change.restore()
    focus.restore()
  }

  it('should not provide mutators when readonly', () => {
    const result = readFields(
      {
        asyncBlurFields: [],
        blur,
        change,
        fields: ['foo', 'bar'],
        focus,
        form: {},
        readonly: true,
        validate: noValidation,
      },
      {},
      {},
    )
    expectField({
      dirty: false,
      error: undefined,
      field: result.foo,
      initialValue: undefined,
      name: 'foo',
      readonly: true,
      touched: false,
      value: undefined,
      visited: false,
    })
    expectField({
      dirty: false,
      error: undefined,
      field: result.bar,
      initialValue: undefined,
      name: 'bar',
      readonly: true,
      touched: false,
      value: undefined,
      visited: false,
    })
    expect(result._meta.allPristine).toBe(true)
    expect(result._meta.allValid).toBe(true)
    expect(result._meta.values).toEqual({bar: undefined, foo: undefined})
    expect(result._meta.errors).toEqual({})
  })

  it('should initialize fields', () => {
    const result = readFields(
      {
        asyncBlurFields: [],
        blur,
        change,
        fields: ['foo', 'bar'],
        focus,
        form: {
          bar: {
            value: 'barValue',
          },
          foo: {
            value: 'fooValue',
          },
        },
        validate: noValidation,
      },
      {},
      {},
    )
    expectField({
      dirty: true,
      error: undefined,
      field: result.foo,
      initialValue: undefined,
      name: 'foo',
      readonly: false,
      touched: false,
      value: 'fooValue',
      visited: false,
    })
    expectField({
      dirty: true,
      error: undefined,
      field: result.bar,
      initialValue: undefined,
      name: 'bar',
      readonly: false,
      touched: false,
      value: 'barValue',
      visited: false,
    })
    expect(result._meta.allPristine).toBe(false)
    expect(result._meta.allValid).toBe(true)
    expect(result._meta.values).toEqual({bar: 'barValue', foo: 'fooValue'})
    expect(result._meta.errors).toEqual({})
  })

  it('should initialize fields with initial values', () => {
    const result = readFields(
      {
        asyncBlurFields: [],
        blur,
        change,
        fields: ['foo', 'bar'],
        focus,
        form: {
          bar: {
            value: 43,
          },
          foo: {
            value: 'fooValue',
          },
        },
        initialValues: {
          bar: 42,
          foo: 'initialFoo',
        },
        validate: noValidation,
      },
      {},
      {},
    )
    expectField({
      dirty: true,
      error: undefined,
      field: result.foo,
      initialValue: 'initialFoo',
      name: 'foo',
      readonly: false,
      touched: false,
      valid: true,
      value: 'fooValue',
      visited: false,
    })
    expectField({
      dirty: true,
      error: undefined,
      field: result.bar,
      initialValue: 42,
      name: 'bar',
      readonly: false,
      touched: false,
      valid: true,
      value: 43,
      visited: false,
    })
    expect(result._meta.allPristine).toBe(false)
    expect(result._meta.allValid).toBe(true)
    expect(result._meta.values).toEqual({bar: 43, foo: 'fooValue'})
    expect(result._meta.errors).toEqual({})
  })

  it('should initialize fields with sync errors', () => {
    const result = readFields(
      {
        asyncBlurFields: [],
        blur,
        change,
        fields: ['foo', 'bar'],
        focus,
        form: {
          bar: {
            value: 'barValue',
          },
          foo: {
            value: 'fooValue',
          },
        },
        validate: () => ({
          bar: 'barError',
          foo: 'fooError',
        }),
      },
      {},
      {},
    )
    expectField({
      dirty: true,
      error: 'fooError',
      field: result.foo,
      initialValue: undefined,
      name: 'foo',
      readonly: false,
      touched: false,
      value: 'fooValue',
      visited: false,
    })
    expectField({
      dirty: true,
      error: 'barError',
      field: result.bar,
      initialValue: undefined,
      name: 'bar',
      readonly: false,
      touched: false,
      value: 'barValue',
      visited: false,
    })
    expect(result._meta.allPristine).toBe(false)
    expect(result._meta.allValid).toBe(false)
    expect(result._meta.values).toEqual({bar: 'barValue', foo: 'fooValue'})
    expect(result._meta.errors).toEqual({bar: 'barError', foo: 'fooError'})
  })

  it('should initialize nested fields with sync errors', () => {
    const result = readFields(
      {
        asyncBlurFields: [],
        blur,
        change,
        fields: ['foo.bar'],
        focus,
        form: {
          foo: {
            bar: {
              value: 'barValue',
            },
          },
        },
        validate: () => ({
          foo: {
            bar: 'barError',
          },
        }),
      },
      {},
      {},
    )
    expectField({
      dirty: true,
      error: 'barError',
      field: result.foo.bar,
      initialValue: undefined,
      name: 'foo.bar',
      readonly: false,
      touched: false,
      value: 'barValue',
      visited: false,
    })
    expect(result._meta.allPristine).toBe(false)
    expect(result._meta.allValid).toBe(false)
    expect(result._meta.values).toEqual({foo: {bar: 'barValue'}})
    expect(result._meta.errors).toEqual({foo: {bar: 'barError'}})
  })

  it('should initialize array fields with sync errors', () => {
    const result = readFields(
      {
        asyncBlurFields: [],
        blur,
        change,
        fields: ['foo[]', 'bar[].age'],
        focus,
        form: {
          bar: [
            {
              age: {
                value: 'barValue',
              },
            },
          ],
          foo: [
            {
              value: 'fooValue',
            },
          ],
        },
        validate: () => ({
          bar: [{age: 'barError'}],
          foo: ['fooError'],
        }),
      },
      {},
      {},
    )
    expectField({
      dirty: true,
      error: 'fooError',
      field: result.foo[0],
      initialValue: undefined,
      name: 'foo[0]',
      readonly: false,
      touched: false,
      value: 'fooValue',
      visited: false,
    })
    expectField({
      dirty: true,
      error: 'barError',
      field: result.bar[0].age,
      initialValue: undefined,
      name: 'bar[0].age',
      readonly: false,
      touched: false,
      value: 'barValue',
      visited: false,
    })
    expect(result._meta.allPristine).toBe(false)
    expect(result._meta.allValid).toBe(false)
    expect(result._meta.values).toEqual({bar: [{age: 'barValue'}], foo: ['fooValue']})
    expect(result._meta.errors).toEqual({bar: [{age: 'barError'}], foo: ['fooError']})
  })

  it('should update fields', () => {
    const props = {
      asyncBlurFields: [],
      blur,
      change,
      fields: ['foo', 'bar'],
      focus,
      form: {
        bar: {
          value: 'barValue',
        },
        foo: {
          value: 'fooValue',
        },
      },
      validate: noValidation,
    }
    const previous = readFields(props, {}, {})
    const result = readFields(
      {
        ...props,
        form: {
          bar: {
            value: 'barValue',
          },
          foo: {
            value: 'fooValueNew',
          },
        },
        validate: noValidation,
      },
      {
        ...props,
        form: {
          bar: {
            value: 'barValue',
          },
          foo: {
            value: 'fooValueNew',
          },
        },
        validate: noValidation,
      },
      previous,
    )
    expectField({
      dirty: true,
      error: undefined,
      field: result.foo,
      initialValue: undefined,
      name: 'foo',
      readonly: false,
      touched: false,
      value: 'fooValueNew',
      visited: false,
    })
    expectField({
      dirty: true,
      error: undefined,
      field: result.bar,
      initialValue: undefined,
      name: 'bar',
      readonly: false,
      touched: false,
      value: 'barValue',
      visited: false,
    })
    expect(result._meta.allPristine).toBe(false)
    expect(result._meta.allValid).toBe(true)
    expect(result._meta.values).toEqual({bar: 'barValue', foo: 'fooValueNew'})
    expect(result._meta.errors).toEqual({})
  })

  it('should set checked for checkbox', () => {
    const result = readFields(
      {
        asyncBlurFields: [],
        blur,
        change,
        fields: ['foo', 'bar', 'another', 'stringField'],
        focus,
        form: {
          another: {
            value: undefined,
          },
          bar: {
            value: true,
          },
          foo: {
            value: false,
          },
          stringField: {
            value: 'baz',
          },
        },
        validate: noValidation,
      },
      {},
      {},
    )
    expectField({
      dirty: true,
      checked: false,
      error: undefined,
      field: result.foo,
      initialValue: undefined,
      name: 'foo',
      readonly: false,
      touched: false,
      value: false,
      visited: false,
    })
    expectField({
      dirty: true,
      checked: true,
      error: undefined,
      field: result.bar,
      initialValue: undefined,
      name: 'bar',
      readonly: false,
      touched: false,
      value: true,
      visited: false,
    })
    expectField({
      dirty: false,
      checked: undefined,
      error: undefined,
      field: result.another,
      initialValue: undefined,
      name: 'another',
      readonly: false,
      touched: false,
      value: undefined,
      visited: false,
    })
    expectField({
      dirty: true,
      checked: undefined,
      error: undefined,
      field: result.stringField,
      initialValue: undefined,
      name: 'stringField',
      readonly: false,
      touched: false,
      value: 'baz',
      visited: false,
    })
  })

  it('should initialize new fields', () => {
    const props = {
      asyncBlurFields: [],
      blur,
      change,
      fields: ['foo', 'bar'],
      focus,
      form: {
        bar: {
          value: 'barValue',
        },
        foo: {
          value: 'fooValue',
        },
      },
      validate: noValidation,
    }
    const previous = readFields(props, {}, {})
    const result = readFields(
      {
        ...props,
        fields: ['foo', 'bar', 'cat', 'dog'],
      },
      {
        ...props,
        fields: ['foo', 'bar', 'cat', 'dog'],
      },
      previous,
    )
    expectField({
      dirty: true,
      error: undefined,
      field: result.foo,
      initialValue: undefined,
      name: 'foo',
      readonly: false,
      touched: false,
      value: 'fooValue',
      visited: false,
    })
    expectField({
      dirty: true,
      error: undefined,
      field: result.bar,
      initialValue: undefined,
      name: 'bar',
      readonly: false,
      touched: false,
      value: 'barValue',
      visited: false,
    })
    expectField({
      dirty: false,
      error: undefined,
      field: result.cat,
      initialValue: undefined,
      name: 'cat',
      readonly: false,
      touched: false,
      value: undefined,
      visited: false,
    })
    expectField({
      dirty: false,
      error: undefined,
      field: result.dog,
      initialValue: undefined,
      name: 'dog',
      readonly: false,
      touched: false,
      value: undefined,
      visited: false,
    })
    expect(result._meta.allPristine).toBe(false)
    expect(result._meta.allValid).toBe(true)
    expect(result._meta.values).toEqual({bar: 'barValue', cat: undefined, dog: undefined, foo: 'fooValue'})
    expect(result._meta.errors).toEqual({})
  })

  it('should remove fields', () => {
    const props = {
      asyncBlurFields: [],
      blur,
      change,
      fields: ['foo', 'bar'],
      focus,
      form: {
        bar: {
          value: 'barValue',
        },
      },
      validate: noValidation,
    }
    const previous = readFields(props, {}, {})
    const result = readFields(
      {
        ...props,
        fields: ['bar'],
      },
      props,
      previous,
    )
    expect(Object.keys(result).length).toBe(1)
    expect(result.foo).toBe(undefined)
    expectField({
      dirty: true,
      error: undefined,
      field: result.bar,
      initialValue: undefined,
      name: 'bar',
      readonly: false,
      touched: false,
      value: 'barValue',
      visited: false,
    })
    expect(result._meta.allPristine).toBe(false)
    expect(result._meta.allValid).toBe(true)
    expect(result._meta.values).toEqual({bar: 'barValue'})
    expect(result._meta.errors).toEqual({})
  })

  it('should handle dirty', () => {
    const result = readFields(
      {
        asyncBlurFields: [],
        blur,
        change,
        fields: ['foo', 'bar'],
        focus,
        form: {
          bar: {
            initial: 'fooValue',
            value: 'barValue',
          },
          foo: {
            initial: 'fooValue',
            value: 'fooValue',
          },
        },
        validate: noValidation,
      },
      {},
      {},
    )
    expectField({
      dirty: false,
      error: undefined,
      field: result.foo,
      initialValue: 'fooValue',
      name: 'foo',
      readonly: false,
      touched: false,
      value: 'fooValue',
      visited: false,
    })
    expectField({
      dirty: true,
      error: undefined,
      field: result.bar,
      initialValue: 'fooValue',
      name: 'bar',
      readonly: false,
      touched: false,
      value: 'barValue',
      visited: false,
    })
    expect(result._meta.allPristine).toBe(false)
    expect(result._meta.allValid).toBe(true)
    expect(result._meta.values).toEqual({bar: 'barValue', foo: 'fooValue'})
    expect(result._meta.errors).toEqual({})
  })

  it('should handle pristine', () => {
    const result = readFields(
      {
        asyncBlurFields: [],
        blur,
        change,
        fields: ['foo', 'bar'],
        focus,
        form: {
          bar: {
            initial: 'barValue',
            value: 'barValue',
          },
          foo: {
            initial: 'fooValue',
            value: 'fooValue',
          },
        },
        validate: noValidation,
      },
      {},
      {},
    )
    expectField({
      dirty: false,
      error: undefined,
      field: result.foo,
      initialValue: 'fooValue',
      name: 'foo',
      readonly: false,
      touched: false,
      value: 'fooValue',
      visited: false,
    })
    expectField({
      dirty: false,
      error: undefined,
      field: result.bar,
      initialValue: 'barValue',
      name: 'bar',
      readonly: false,
      touched: false,
      value: 'barValue',
      visited: false,
    })
    expect(result._meta.allPristine).toBe(true)
    expect(result._meta.allValid).toBe(true)
    expect(result._meta.values).toEqual({bar: 'barValue', foo: 'fooValue'})
    expect(result._meta.errors).toEqual({})
  })

  it('should handle touched', () => {
    const result = readFields(
      {
        asyncBlurFields: [],
        blur,
        change,
        fields: ['foo', 'bar'],
        focus,
        form: {
          bar: {
            value: 'barValue',
          },
          foo: {
            touched: true,
            value: 'fooValue',
          },
        },
        validate: noValidation,
      },
      {},
      {},
    )
    expectField({
      dirty: true,
      error: undefined,
      field: result.foo,
      initialValue: undefined,
      name: 'foo',
      readonly: false,
      touched: true,
      value: 'fooValue',
      visited: false,
    })
    expectField({
      dirty: true,
      error: undefined,
      field: result.bar,
      initialValue: undefined,
      name: 'bar',
      readonly: false,
      touched: false,
      value: 'barValue',
      visited: false,
    })
    expect(result._meta.allPristine).toBe(false)
    expect(result._meta.allValid).toBe(true)
    expect(result._meta.values).toEqual({bar: 'barValue', foo: 'fooValue'})
    expect(result._meta.errors).toEqual({})
  })

  it('should handle visited', () => {
    const result = readFields(
      {
        asyncBlurFields: [],
        blur,
        change,
        fields: ['foo', 'bar'],
        focus,
        form: {
          bar: {
            value: 'barValue',
            visited: true,
          },
          foo: {
            value: 'fooValue',
            visited: true,
          },
        },
        validate: noValidation,
      },
      {},
      {},
    )
    expectField({
      dirty: true,
      error: undefined,
      field: result.foo,
      initialValue: undefined,
      name: 'foo',
      readonly: false,
      touched: false,
      value: 'fooValue',
      visited: true,
    })
    expectField({
      dirty: true,
      error: undefined,
      field: result.bar,
      initialValue: undefined,
      name: 'bar',
      readonly: false,
      touched: false,
      value: 'barValue',
      visited: true,
    })
    expect(result._meta.allPristine).toBe(false)
    expect(result._meta.allValid).toBe(true)
    expect(result._meta.values).toEqual({bar: 'barValue', foo: 'fooValue'})
    expect(result._meta.errors).toEqual({})
  })

  it('should handle async errors', () => {
    const result = readFields(
      {
        asyncBlurFields: [],
        blur,
        change,
        fields: ['foo', 'bar'],
        focus,
        form: {
          bar: {
            asyncError: 'barAsyncError',
            value: 'barValue',
          },
          foo: {
            asyncError: 'fooAsyncError',
            value: 'fooValue',
          },
        },
        validate: noValidation,
      },
      {},
      {},
    )
    expectField({
      dirty: true,
      error: 'fooAsyncError',
      field: result.foo,
      initialValue: undefined,
      name: 'foo',
      readonly: false,
      touched: false,
      value: 'fooValue',
      visited: false,
    })
    expectField({
      dirty: true,
      error: 'barAsyncError',
      field: result.bar,
      initialValue: undefined,
      name: 'bar',
      readonly: false,
      touched: false,
      value: 'barValue',
      visited: false,
    })
    expect(result._meta.allPristine).toBe(false)
    expect(result._meta.allValid).toBe(false)
    expect(result._meta.values).toEqual({bar: 'barValue', foo: 'fooValue'})
    expect(result._meta.errors).toEqual({bar: 'barAsyncError', foo: 'fooAsyncError'})
  })

  it('should handle submit errors', () => {
    const result = readFields(
      {
        asyncBlurFields: [],
        blur,
        change,
        fields: ['foo', 'bar'],
        focus,
        form: {
          bar: {
            submitError: 'barSubmitError',
            value: 'barValue',
          },
          foo: {
            submitError: 'fooSubmitError',
            value: 'fooValue',
          },
        },
        validate: noValidation,
      },
      {},
      {},
    )
    expectField({
      dirty: true,
      error: 'fooSubmitError',
      field: result.foo,
      initialValue: undefined,
      name: 'foo',
      readonly: false,
      touched: false,
      value: 'fooValue',
      visited: false,
    })
    expectField({
      dirty: true,
      error: 'barSubmitError',
      field: result.bar,
      initialValue: undefined,
      name: 'bar',
      readonly: false,
      touched: false,
      value: 'barValue',
      visited: false,
    })
    expect(result._meta.allPristine).toBe(false)
    expect(result._meta.allValid).toBe(false)
    expect(result._meta.values).toEqual({bar: 'barValue', foo: 'fooValue'})
    expect(result._meta.errors).toEqual({bar: 'barSubmitError', foo: 'fooSubmitError'})
  })

  it('should prioritize submit errors over async errors', () => {
    const result = readFields(
      {
        asyncBlurFields: [],
        blur,
        change,
        fields: ['foo', 'bar'],
        focus,
        form: {
          bar: {
            asyncError: 'barAsyncError',
            submitError: 'barSubmitError',
            value: 'barValue',
          },
          foo: {
            asyncError: 'fooAsyncError',
            submitError: 'fooSubmitError',
            value: 'fooValue',
          },
        },
        validate: noValidation,
      },
      {},
      {},
    )
    expectField({
      dirty: true,
      error: 'fooSubmitError',
      field: result.foo,
      initialValue: undefined,
      name: 'foo',
      readonly: false,
      touched: false,
      value: 'fooValue',
      visited: false,
    })
    expectField({
      dirty: true,
      error: 'barSubmitError',
      field: result.bar,
      initialValue: undefined,
      name: 'bar',
      readonly: false,
      touched: false,
      value: 'barValue',
      visited: false,
    })
    expect(result._meta.allPristine).toBe(false)
    expect(result._meta.allValid).toBe(false)
    expect(result._meta.values).toEqual({bar: 'barValue', foo: 'fooValue'})
    expect(result._meta.errors).toEqual({bar: 'barSubmitError', foo: 'fooSubmitError'})
  })

  it('should prioritize sync errors over submit errors', () => {
    const result = readFields(
      {
        asyncBlurFields: [],
        blur,
        change,
        fields: ['foo', 'bar'],
        focus,
        form: {
          bar: {
            submitError: 'barSubmitError',
            value: 'barValue',
          },
          foo: {
            submitError: 'fooSubmitError',
            value: 'fooValue',
          },
        },
        validate: () => ({
          bar: 'barSyncError',
          foo: 'fooSyncError',
        }),
      },
      {},
      {},
    )
    expectField({
      dirty: true,
      error: 'fooSyncError',
      field: result.foo,
      initialValue: undefined,
      name: 'foo',
      readonly: false,
      touched: false,
      value: 'fooValue',
      visited: false,
    })
    expectField({
      dirty: true,
      error: 'barSyncError',
      field: result.bar,
      initialValue: undefined,
      name: 'bar',
      readonly: false,
      touched: false,
      value: 'barValue',
      visited: false,
    })
    expect(result._meta.allPristine).toBe(false)
    expect(result._meta.allValid).toBe(false)
    expect(result._meta.values).toEqual({bar: 'barValue', foo: 'fooValue'})
    expect(result._meta.errors).toEqual({bar: 'barSyncError', foo: 'fooSyncError'})
  })

  it('should handle form error via sync errors', () => {
    const result = readFields(
      {
        asyncBlurFields: [],
        blur,
        change,
        fields: ['foo', 'bar'],
        focus,
        form: {
          bar: {
            value: 'barValue',
          },
          foo: {
            value: 'fooValue',
          },
        },
        validate: () => ({
          _error: 'formSyncError',
        }),
      },
      {},
      {},
    )
    expectField({
      dirty: true,
      error: undefined,
      field: result.foo,
      initialValue: undefined,
      name: 'foo',
      readonly: false,
      touched: false,
      value: 'fooValue',
      visited: false,
    })
    expectField({
      dirty: true,
      error: undefined,
      field: result.bar,
      initialValue: undefined,
      name: 'bar',
      readonly: false,
      touched: false,
      value: 'barValue',
      visited: false,
    })
    expect(result._meta.allPristine).toBe(false)
    expect(result._meta.allValid).toBe(false)
    expect(result._meta.values).toEqual({bar: 'barValue', foo: 'fooValue'})
    expect(result._meta.errors).toEqual({})
    expect(result._meta.formError).toEqual('formSyncError')
  })

  it('should handle form error via reducer state', () => {
    const result = readFields(
      {
        asyncBlurFields: [],
        blur,
        change,
        fields: ['foo', 'bar'],
        focus,
        form: {
          _error: 'formReducerError',
          bar: {
            value: 'barValue',
          },
          foo: {
            value: 'fooValue',
          },
        },
        validate: noValidation,
      },
      {},
      {},
    )
    expectField({
      dirty: true,
      error: undefined,
      field: result.foo,
      initialValue: undefined,
      name: 'foo',
      readonly: false,
      touched: false,
      value: 'fooValue',
      visited: false,
    })
    expectField({
      dirty: true,
      error: undefined,
      field: result.bar,
      initialValue: undefined,
      name: 'bar',
      readonly: false,
      touched: false,
      value: 'barValue',
      visited: false,
    })
    expect(result._meta.allPristine).toBe(false)
    expect(result._meta.allValid).toBe(false)
    expect(result._meta.values).toEqual({bar: 'barValue', foo: 'fooValue'})
    expect(result._meta.errors).toEqual({})
    expect(result._meta.formError).toEqual('formReducerError')
  })

  it('should prioritize sync form error over reducer form error', () => {
    const result = readFields(
      {
        asyncBlurFields: [],
        blur,
        change,
        fields: ['foo', 'bar'],
        focus,
        form: {
          _error: 'formReducerError',
          bar: {
            value: 'barValue',
          },
          foo: {
            value: 'fooValue',
          },
        },
        validate: () => ({
          _error: 'formSyncError',
        }),
      },
      {},
      {},
    )
    expectField({
      dirty: true,
      error: undefined,
      field: result.foo,
      initialValue: undefined,
      name: 'foo',
      readonly: false,
      touched: false,
      value: 'fooValue',
      visited: false,
    })
    expectField({
      dirty: true,
      error: undefined,
      field: result.bar,
      initialValue: undefined,
      name: 'bar',
      readonly: false,
      touched: false,
      value: 'barValue',
      visited: false,
    })
    expect(result._meta.allPristine).toBe(false)
    expect(result._meta.allValid).toBe(false)
    expect(result._meta.values).toEqual({bar: 'barValue', foo: 'fooValue'})
    expect(result._meta.errors).toEqual({})
    expect(result._meta.formError).toEqual('formSyncError')
  })

  it('should not modify existing field object on change', () => {
    const props1 = {
      asyncBlurFields: [],
      blur,
      change,
      fields: ['foo', 'bar'],
      focus,
      form: {
        bar: {
          value: 'barValue',
        },
        foo: {
          value: 'fooValue',
        },
      },
      validate: noValidation,
    }
    const result1 = readFields(props1, {}, {})
    const foo1 = result1.foo
    const bar1 = result1.bar
    expect(foo1.value).toBe('fooValue')
    const props2 = {
      asyncBlurFields: [],
      blur,
      change,
      fields: ['foo', 'bar'],
      focus,
      form: {
        bar: {
          value: 'barValue',
        },
        foo: {
          value: 'newValue',
        },
      },
      validate: noValidation,
    }
    const result2 = readFields(props2, props1, result1)
    const foo2 = result2.foo
    const bar2 = result2.bar
    expect(foo1.value).toBe('fooValue')
    expect(foo2.value).toBe('newValue')
    expect(foo1).toNotBe(foo2)
    expect(bar1).toBe(bar2)
  })

  it('should init deep fields', () => {
    const result = readFields(
      {
        asyncBlurFields: [],
        blur,
        change,
        fields: ['foo.dog', 'foo.cat', 'bar.rat', 'bar.ram'],
        focus,
        form: {},
        validate: noValidation,
      },
      {},
      {},
    )
    expectField({
      dirty: false,
      error: undefined,
      field: result.foo.dog,
      initialValue: undefined,
      name: 'foo.dog',
      readonly: false,
      touched: false,
      value: undefined,
      visited: false,
    })
    expectField({
      dirty: false,
      error: undefined,
      field: result.foo.cat,
      initialValue: undefined,
      name: 'foo.cat',
      readonly: false,
      touched: false,
      value: undefined,
      visited: false,
    })
    expectField({
      dirty: false,
      error: undefined,
      field: result.bar.rat,
      initialValue: undefined,
      name: 'bar.rat',
      readonly: false,
      touched: false,
      value: undefined,
      visited: false,
    })
    expectField({
      dirty: false,
      error: undefined,
      field: result.bar.ram,
      initialValue: undefined,
      name: 'bar.ram',
      readonly: false,
      touched: false,
      value: undefined,
      visited: false,
    })
  })
})
