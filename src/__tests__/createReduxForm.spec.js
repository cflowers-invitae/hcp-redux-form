/* eslint react/no-multi-comp:0 */
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import TestUtils from 'react-dom/test-utils'
import {connect} from 'react-redux'
import {Provider} from 'react-redux'
import PropTypes from 'prop-types'
import {combineReducers, createStore} from 'redux'

import createReduxForm from '../createReduxForm'
import reducer from '../reducer'

describe('createReduxForm', () => {
  const reduxForm = createReduxForm(false, React, PropTypes, connect)
  const makeStore = () =>
    createStore(
      combineReducers({
        form: reducer,
      }),
    )

  it('should return a decorator function', () => {
    expect(reduxForm).toBeInstanceOf(Function)
  })

  class Form extends React.Component {
    render() {
      return <div />
    }
  }

  const expectField = ({field, name, value, initial, valid, dirty, error, touched, visited, readonly}) => {
    expect(field).toBeInstanceOf(Object)
    expect(field.name).toBe(name)
    expect(field.value).toEqual(value)
    if (readonly) {
      expect(field.onBlur).toBeUndefined()
      expect(field.onChange).toBeUndefined()
      expect(field.onDragStart).toBeUndefined()
      expect(field.onDrop).toBeUndefined()
      expect(field.onFocus).toBeUndefined()
      expect(field.onUpdate).toBeUndefined()
    } else {
      expect(field.onBlur).toBeInstanceOf(Function)
      expect(field.onChange).toBeInstanceOf(Function)
      expect(field.onDragStart).toBeInstanceOf(Function)
      expect(field.onDrop).toBeInstanceOf(Function)
      expect(field.onFocus).toBeInstanceOf(Function)
      expect(field.onUpdate).toBeInstanceOf(Function)
    }
    expect(field.initialValue).toEqual(initial)
    expect(field.defaultValue).toEqual(initial)
    expect(field.defaultChecked).toBe(initial === true)
    expect(field.valid).toBe(valid)
    expect(field.invalid).toBe(!valid)
    expect(field.dirty).toBe(dirty)
    expect(field.pristine).toBe(!dirty)
    expect(field.error).toEqual(error)
    expect(field.touched).toBe(touched)
    expect(field.visited).toBe(visited)
  }

  it('should render without error', () => {
    const store = makeStore()
    expect(() => {
      const Decorated = reduxForm({
        fields: ['foo', 'bar'],
        form: 'testForm',
      })(Form)

      TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Decorated />
        </Provider>,
      )
    }).not.toThrow()
  })

  it('should pass fields as props', () => {
    const store = makeStore()
    const Decorated = reduxForm({
      fields: ['foo', 'bar'],
      form: 'testForm',
    })(Form)
    const doc = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Decorated />
      </Provider>,
    )
    const stub = TestUtils.findRenderedComponentWithType(doc, Form)
    expect(stub.props.fields).toBeInstanceOf(Object)
    expectField({
      dirty: false,
      error: undefined,
      field: stub.props.fields.foo,
      initial: undefined,
      name: 'foo',
      readonly: false,
      touched: false,
      valid: true,
      value: undefined,
      visited: false,
    })
    expectField({
      dirty: false,
      error: undefined,
      field: stub.props.fields.bar,
      initial: undefined,
      name: 'bar',
      readonly: false,
      touched: false,
      valid: true,
      value: undefined,
      visited: false,
    })
  })

  it('should initialize field values', () => {
    const store = makeStore()
    const Decorated = reduxForm({
      fields: ['foo', 'bar'],
      form: 'testForm',
    })(Form)
    const doc = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Decorated initialValues={{bar: 'barValue', foo: 'fooValue'}} />
      </Provider>,
    )
    const stub = TestUtils.findRenderedComponentWithType(doc, Form)
    expect(stub.props.fields).toBeInstanceOf(Object)
    expectField({
      dirty: false,
      error: undefined,
      field: stub.props.fields.foo,
      initial: 'fooValue',
      name: 'foo',
      readonly: false,
      touched: false,
      valid: true,
      value: 'fooValue',
      visited: false,
    })
    expectField({
      dirty: false,
      error: undefined,
      field: stub.props.fields.bar,
      initial: 'barValue',
      name: 'bar',
      readonly: false,
      touched: false,
      valid: true,
      value: 'barValue',
      visited: false,
    })
  })

  it('should set value and touch field on blur', () => {
    const store = makeStore()
    const form = 'testForm'
    const Decorated = reduxForm({
      fields: ['foo', 'bar'],
      form,
    })(Form)
    const doc = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Decorated />
      </Provider>,
    )
    const stub = TestUtils.findRenderedComponentWithType(doc, Form)

    stub.props.fields.foo.onBlur('fooValue')

    expect(stub.props.fields).toBeInstanceOf(Object)
    expectField({
      dirty: true,
      error: undefined,
      field: stub.props.fields.foo,
      initial: undefined,
      name: 'foo',
      readonly: false,
      touched: true,
      valid: true,
      value: 'fooValue',
      visited: false,
    })
    expectField({
      dirty: false,
      error: undefined,
      field: stub.props.fields.bar,
      initial: undefined,
      name: 'bar',
      readonly: false,
      touched: false,
      valid: true,
      value: undefined,
      visited: false,
    })
  })

  it('should set value and NOT touch field on blur if touchOnBlur is disabled', () => {
    const store = makeStore()
    const form = 'testForm'
    const Decorated = reduxForm({
      fields: ['foo', 'bar'],
      form,
      touchOnBlur: false,
    })(Form)
    const doc = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Decorated />
      </Provider>,
    )
    TestUtils.renderIntoDocument(Form)
    const stub = TestUtils.findRenderedComponentWithType(doc, Form)

    stub.props.fields.foo.onBlur('fooValue')

    expect(stub.props.fields).toBeInstanceOf(Object)
    expectField({
      dirty: true,
      error: undefined,
      field: stub.props.fields.foo,
      initial: undefined,
      name: 'foo',
      readonly: false,
      touched: false,
      valid: true,
      value: 'fooValue',
      visited: false,
    })
    expectField({
      dirty: false,
      error: undefined,
      field: stub.props.fields.bar,
      initial: undefined,
      name: 'bar',
      readonly: false,
      touched: false,
      valid: true,
      value: undefined,
      visited: false,
    })
  })

  it('should set value and NOT touch field on change', () => {
    const store = makeStore()
    const form = 'testForm'
    const Decorated = reduxForm({
      fields: ['foo', 'bar'],
      form,
    })(Form)
    const doc = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Decorated />
      </Provider>,
    )
    TestUtils.renderIntoDocument(Form)
    const stub = TestUtils.findRenderedComponentWithType(doc, Form)

    stub.props.fields.foo.onChange('fooValue')

    expect(stub.props.fields).toBeInstanceOf(Object)
    expectField({
      dirty: true,
      error: undefined,
      field: stub.props.fields.foo,
      initial: undefined,
      name: 'foo',
      readonly: false,
      touched: false,
      valid: true,
      value: 'fooValue',
      visited: false,
    })
    expectField({
      dirty: false,
      error: undefined,
      field: stub.props.fields.bar,
      initial: undefined,
      name: 'bar',
      readonly: false,
      touched: false,
      valid: true,
      value: undefined,
      visited: false,
    })
  })

  it('should set value and touch field on change if touchOnChange is enabled', () => {
    const store = makeStore()
    const form = 'testForm'
    const Decorated = reduxForm({
      fields: ['foo', 'bar'],
      form,
      touchOnChange: true,
    })(Form)
    const doc = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Decorated />
      </Provider>,
    )
    TestUtils.renderIntoDocument(Form)
    const stub = TestUtils.findRenderedComponentWithType(doc, Form)

    stub.props.fields.foo.onChange('fooValue')

    expect(stub.props.fields).toBeInstanceOf(Object)
    expectField({
      dirty: true,
      error: undefined,
      field: stub.props.fields.foo,
      initial: undefined,
      name: 'foo',
      readonly: false,
      touched: true,
      valid: true,
      value: 'fooValue',
      visited: false,
    })
    expectField({
      dirty: false,
      error: undefined,
      field: stub.props.fields.bar,
      initial: undefined,
      name: 'bar',
      readonly: false,
      touched: false,
      valid: true,
      value: undefined,
      visited: false,
    })
  })

  it('should set visited field on focus', () => {
    const store = makeStore()
    const form = 'testForm'
    const Decorated = reduxForm({
      fields: ['foo', 'bar'],
      form,
    })(Form)
    const doc = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Decorated />
      </Provider>,
    )
    TestUtils.renderIntoDocument(Form)
    const stub = TestUtils.findRenderedComponentWithType(doc, Form)

    expect(stub.props.active).toBe(undefined)

    stub.props.fields.foo.onFocus()

    expect(stub.props.active).toBe('foo')

    expect(stub.props.fields).toBeInstanceOf(Object)
    expectField({
      dirty: false,
      error: undefined,
      field: stub.props.fields.foo,
      initial: undefined,
      name: 'foo',
      readonly: false,
      touched: false,
      valid: true,
      value: undefined,
      visited: true,
    })
    expectField({
      dirty: false,
      error: undefined,
      field: stub.props.fields.bar,
      initial: undefined,
      name: 'bar',
      readonly: false,
      touched: false,
      valid: true,
      value: undefined,
      visited: false,
    })
  })

  it('should set dirty when field changes', () => {
    const store = makeStore()
    const form = 'testForm'
    const Decorated = reduxForm({
      fields: ['foo', 'bar'],
      form,
    })(Form)
    const doc = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Decorated initialValues={{bar: 'barValue', foo: 'fooValue'}} />
      </Provider>,
    )
    TestUtils.renderIntoDocument(Form)
    const stub = TestUtils.findRenderedComponentWithType(doc, Form)

    expectField({
      dirty: false,
      error: undefined,
      field: stub.props.fields.foo,
      initial: 'fooValue',
      name: 'foo',
      readonly: false,
      touched: false,
      valid: true,
      value: 'fooValue',
      visited: false,
    })

    stub.props.fields.foo.onChange('fooValue!')

    expectField({
      dirty: true,
      error: undefined,
      field: stub.props.fields.foo,
      initial: 'fooValue',
      name: 'foo',
      readonly: false,
      touched: false,
      valid: true,
      value: 'fooValue!',
      visited: false,
    })
  })

  it('should set dirty when and array field changes', () => {
    const store = makeStore()
    const form = 'testForm'
    const Decorated = reduxForm({
      fields: ['children[].name'],
      form,
    })(Form)
    const doc = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Decorated initialValues={{children: [{name: 'Tom'}, {name: 'Jerry'}]}} />
      </Provider>,
    )
    TestUtils.renderIntoDocument(Form)
    const stub = TestUtils.findRenderedComponentWithType(doc, Form)

    expect(stub.props.fields.children).toBeInstanceOf(Array)
    expect(stub.props.fields.children.length).toBe(2)

    expectField({
      dirty: false,
      error: undefined,
      field: stub.props.fields.children[0].name,
      initial: 'Tom',
      name: 'children[0].name',
      readonly: false,
      touched: false,
      valid: true,
      value: 'Tom',
      visited: false,
    })
    expectField({
      dirty: false,
      error: undefined,
      field: stub.props.fields.children[1].name,
      initial: 'Jerry',
      name: 'children[1].name',
      readonly: false,
      touched: false,
      valid: true,
      value: 'Jerry',
      visited: false,
    })

    stub.props.fields.children[0].name.onChange('Tim')

    expectField({
      dirty: true,
      error: undefined,
      field: stub.props.fields.children[0].name,
      initial: 'Tom',
      name: 'children[0].name',
      readonly: false,
      touched: false,
      valid: true,
      value: 'Tim',
      visited: false,
    })
    expectField({
      dirty: false,
      error: undefined,
      field: stub.props.fields.children[1].name,
      initial: 'Jerry',
      name: 'children[1].name',
      readonly: false,
      touched: false,
      valid: true,
      value: 'Jerry',
      visited: false,
    })
  })

  it('should trigger sync error on change that invalidates value', () => {
    const store = makeStore()
    const form = 'testForm'
    const Decorated = reduxForm({
      fields: ['foo', 'bar'],
      form,
      validate: values => {
        const errors = {}
        if (values.foo && values.foo.length > 8) {
          errors.foo = 'Too long'
        }
        if (!values.bar) {
          errors.bar = 'Required'
        }
        return errors
      },
    })(Form)
    const doc = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Decorated initialValues={{bar: 'barValue', foo: 'fooValue'}} />
      </Provider>,
    )
    TestUtils.renderIntoDocument(Form)
    const stub = TestUtils.findRenderedComponentWithType(doc, Form)

    expectField({
      dirty: false,
      error: undefined,
      field: stub.props.fields.foo,
      initial: 'fooValue',
      name: 'foo',
      readonly: false,
      touched: false,
      valid: true,
      value: 'fooValue',
      visited: false,
    })

    expectField({
      dirty: false,
      error: undefined,
      field: stub.props.fields.bar,
      initial: 'barValue',
      name: 'bar',
      readonly: false,
      touched: false,
      valid: true,
      value: 'barValue',
      visited: false,
    })
    expect(stub.props.valid).toBe(true)
    expect(stub.props.invalid).toBe(false)
    expect(stub.props.errors).toEqual({})

    stub.props.fields.foo.onChange('fooValue!')

    expectField({
      dirty: true,
      error: 'Too long',
      field: stub.props.fields.foo,
      initial: 'fooValue',
      name: 'foo',
      readonly: false,
      touched: false,
      valid: false,
      value: 'fooValue!',
      visited: false,
    })

    stub.props.fields.bar.onChange('')

    expectField({
      dirty: true,
      error: 'Required',
      field: stub.props.fields.bar,
      initial: 'barValue',
      name: 'bar',
      readonly: false,
      touched: false,
      valid: false,
      value: '',
      visited: false,
    })

    expect(stub.props.valid).toBe(false)
    expect(stub.props.invalid).toBe(true)
    expect(stub.props.errors).toEqual({
      bar: 'Required',
      foo: 'Too long',
    })
  })

  it('should trigger sync error on change that invalidates nested value', () => {
    const store = makeStore()
    const form = 'testForm'
    const Decorated = reduxForm({
      fields: ['foo.bar'],
      form,
      validate: values => {
        const errors = {}
        if (values.foo.bar && values.foo.bar.length > 8) {
          errors.foo = {bar: 'Too long'}
        }
        return errors
      },
    })(Form)
    const doc = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Decorated initialValues={{foo: {bar: 'fooBar'}}} />
      </Provider>,
    )
    TestUtils.renderIntoDocument(Form)
    const stub = TestUtils.findRenderedComponentWithType(doc, Form)

    expectField({
      dirty: false,
      error: undefined,
      field: stub.props.fields.foo.bar,
      initial: 'fooBar',
      name: 'foo.bar',
      readonly: false,
      touched: false,
      valid: true,
      value: 'fooBar',
      visited: false,
    })
    expect(stub.props.valid).toBe(true)
    expect(stub.props.invalid).toBe(false)
    expect(stub.props.errors).toEqual({})

    stub.props.fields.foo.bar.onChange('fooBarBaz')

    expectField({
      dirty: true,
      error: 'Too long',
      field: stub.props.fields.foo.bar,
      initial: 'fooBar',
      name: 'foo.bar',
      readonly: false,
      touched: false,
      valid: false,
      value: 'fooBarBaz',
      visited: false,
    })

    expect(stub.props.valid).toBe(false)
    expect(stub.props.invalid).toBe(true)
    expect(stub.props.errors).toEqual({
      foo: {
        bar: 'Too long',
      },
    })
  })

  it('should trigger sync error on change that invalidates array value', () => {
    const store = makeStore()
    const form = 'testForm'
    const Decorated = reduxForm({
      fields: ['foo[]', 'bar[].name'],
      form,
      validate: values => {
        const errors = {}
        if (values.foo && values.foo.length && values.foo[0] && values.foo[0].length > 8) {
          errors.foo = ['Too long']
        }
        if (values.bar && values.bar.length && values.bar[0] && values.bar[0].name === 'Ralphie') {
          errors.bar = [{name: `You'll shoot your eye out, kid!`}]
        }
        return errors
      },
    })(Form)
    const doc = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Decorated initialValues={{bar: [{name: ''}], foo: ['fooBar']}} />
      </Provider>,
    )
    TestUtils.renderIntoDocument(Form)
    const stub = TestUtils.findRenderedComponentWithType(doc, Form)

    expectField({
      dirty: false,
      error: undefined,
      field: stub.props.fields.foo[0],
      initial: 'fooBar',
      name: 'foo[0]',
      readonly: false,
      touched: false,
      valid: true,
      value: 'fooBar',
      visited: false,
    })

    expectField({
      dirty: false,
      error: undefined,
      field: stub.props.fields.bar[0].name,
      initial: '',
      name: 'bar[0].name',
      readonly: false,
      touched: false,
      valid: true,
      value: '',
      visited: false,
    })
    expect(stub.props.valid).toBe(true)
    expect(stub.props.invalid).toBe(false)
    expect(stub.props.errors).toEqual({})

    stub.props.fields.foo[0].onChange('fooBarBaz')

    expectField({
      dirty: true,
      error: 'Too long',
      field: stub.props.fields.foo[0],
      initial: 'fooBar',
      name: 'foo[0]',
      readonly: false,
      touched: false,
      valid: false,
      value: 'fooBarBaz',
      visited: false,
    })

    stub.props.fields.bar[0].name.onChange('Ralphie')

    expectField({
      dirty: true,
      error: `You'll shoot your eye out, kid!`,
      field: stub.props.fields.bar[0].name,
      initial: '',
      name: 'bar[0].name',
      readonly: false,
      touched: false,
      valid: false,
      value: 'Ralphie',
      visited: false,
    })

    expect(stub.props.valid).toBe(false)
    expect(stub.props.invalid).toBe(true)
    expect(stub.props.errors).toEqual({
      bar: [{name: `You'll shoot your eye out, kid!`}],
      foo: ['Too long'],
    })
  })

  it('should call destroy on unmount', () => {
    const store = makeStore()
    const form = 'testForm'
    const Decorated = reduxForm({
      fields: ['foo', 'bar'],
      form,
    })(Form)

    const div = document.createElement('div')
    ReactDOM.render(
      <Provider store={store}>
        <Decorated initialValues={{bar: 'barValue', foo: 'fooValue'}} />
      </Provider>,
      div,
    )
    const before = store.getState()
    expect(before.form).toBeInstanceOf(Object)
    expect(before.form[form]).toBeInstanceOf(Object)
    expect(before.form[form].foo).toBeInstanceOf(Object)
    expect(before.form[form].bar).toBeInstanceOf(Object)

    ReactDOM.unmountComponentAtNode(div)

    const after = store.getState()
    expect(after.form).toBeInstanceOf(Object)
    expect(after.form[form]).toBeUndefined()
  })

  it('should NOT call destroy on unmount if destroyOnUnmount is disabled', () => {
    const store = makeStore()
    const form = 'testForm'
    const Decorated = reduxForm({
      destroyOnUnmount: false,
      fields: ['foo', 'bar'],
      form,
    })(Form)

    const div = document.createElement('div')
    ReactDOM.render(
      <Provider store={store}>
        <Decorated initialValues={{bar: 'barValue', foo: 'fooValue'}} />
      </Provider>,
      div,
    )
    const before = store.getState()
    expect(before.form).toBeInstanceOf(Object)
    expect(before.form[form]).toBeInstanceOf(Object)
    expect(before.form[form].foo).toBeInstanceOf(Object)
    expect(before.form[form].bar).toBeInstanceOf(Object)

    ReactDOM.unmountComponentAtNode(div)

    const after = store.getState()
    expect(after.form).toBeInstanceOf(Object)
    expect(after.form[form]).toBeInstanceOf(Object)
    expect(after.form[form].foo).toBeInstanceOf(Object)
    expect(after.form[form].bar).toBeInstanceOf(Object)
  })

  it('should hoist statics', () => {
    class FormWithStatics extends React.Component {
      render() {
        return <div />
      }
    }
    FormWithStatics.someStatic1 = 'cat'
    FormWithStatics.someStatic2 = 42

    const Decorated = reduxForm({
      fields: ['foo', 'bar'],
      form: 'testForm',
    })(FormWithStatics)

    expect(Decorated.someStatic1).toBe('cat')
    expect(Decorated.someStatic2).toBe(42)
  })

  it('should not provide mutators when readonly', () => {
    const store = makeStore()
    const form = 'testForm'
    const Decorated = reduxForm({
      fields: ['foo', 'bar'],
      form,
      readonly: true,
    })(Form)
    const doc = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Decorated />
      </Provider>,
    )
    TestUtils.renderIntoDocument(Form)
    const stub = TestUtils.findRenderedComponentWithType(doc, Form)

    expectField({
      dirty: false,
      error: undefined,
      field: stub.props.fields.foo,
      initial: undefined,
      name: 'foo',
      readonly: true,
      touched: false,
      valid: true,
      value: undefined,
      visited: false,
    })

    expectField({
      dirty: false,
      error: undefined,
      field: stub.props.fields.bar,
      initial: undefined,
      name: 'bar',
      readonly: true,
      touched: false,
      valid: true,
      value: undefined,
      visited: false,
    })
  })

  it('should initialize an array field', () => {
    const store = makeStore()
    const form = 'testForm'
    const Decorated = reduxForm({
      fields: ['children[].name'],
      form,
      initialValues: {
        children: [{name: 'Tom'}, {name: 'Jerry'}],
      },
    })(Form)
    const doc = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Decorated />
      </Provider>,
    )
    TestUtils.renderIntoDocument(Form)
    const stub = TestUtils.findRenderedComponentWithType(doc, Form)

    expectField({
      dirty: false,
      error: undefined,
      field: stub.props.fields.children[0].name,
      initial: 'Tom',
      name: 'children[0].name',
      touched: false,
      valid: true,
      value: 'Tom',
      visited: false,
    })

    expectField({
      dirty: false,
      error: undefined,
      field: stub.props.fields.children[1].name,
      initial: 'Jerry',
      name: 'children[1].name',
      touched: false,
      valid: true,
      value: 'Jerry',
      visited: false,
    })
  })

  it('should call onSubmit prop', done => {
    const submit = values => {
      expect(values).toEqual({
        bar: undefined,
        foo: undefined,
      })
      done()
    }

    class FormComponent extends React.Component {
      render() {
        return <form onSubmit={this.props.handleSubmit} />
      }
    }
    FormComponent.propTypes = {
      handleSubmit: PropTypes.func.isRequired,
    }

    const store = makeStore()
    const form = 'testForm'
    const Decorated = reduxForm({
      fields: ['foo', 'bar'],
      form,
      readonly: true,
    })(FormComponent)
    const doc = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Decorated onSubmit={submit} />
      </Provider>,
    )
    const formElement = TestUtils.findRenderedDOMComponentWithTag(doc, 'form')

    TestUtils.Simulate.submit(formElement)
  })

  it('should call async onSubmit prop', done => {
    const submit = values => {
      expect(values).toEqual({
        bar: undefined,
        foo: undefined,
      })
      return new Promise(resolve => {
        setTimeout(() => {
          resolve()
        }, 100)
      }).then(done)
    }

    class FormComponent extends React.Component {
      render() {
        return <form onSubmit={this.props.handleSubmit} />
      }
    }
    FormComponent.propTypes = {
      handleSubmit: PropTypes.func.isRequired,
    }

    const store = makeStore()
    const form = 'testForm'
    const Decorated = reduxForm({
      fields: ['foo', 'bar'],
      form,
      readonly: true,
    })(FormComponent)
    const doc = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Decorated onSubmit={submit} />
      </Provider>,
    )
    const formElement = TestUtils.findRenderedDOMComponentWithTag(doc, 'form')

    TestUtils.Simulate.submit(formElement)
  })

  it('should NOT call async validation if form is pristine and initialized', () => {
    const store = makeStore()
    const form = 'testForm'
    const errorValue = {foo: 'no bears allowed'}
    const asyncValidate = jest.fn(() => Promise.reject(errorValue))
    const Decorated = reduxForm({
      asyncBlurFields: ['foo'],
      asyncValidate,
      fields: ['foo', 'bar'],
      form,
      initialValues: {
        bar: 'cat',
        foo: 'dog',
      },
    })(Form)
    const doc = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Decorated />
      </Provider>,
    )
    TestUtils.renderIntoDocument(Form)
    const stub = TestUtils.findRenderedComponentWithType(doc, Form)

    stub.props.fields.foo.onBlur('dog')
    expect(asyncValidate).not.toHaveBeenCalled()
  })

  it('should call async validation if form is dirty and initialized', () => {
    const store = makeStore()
    const form = 'testForm'
    const errorValue = {foo: 'no bears allowed'}
    const asyncValidate = jest.fn(() => Promise.reject(errorValue))
    const Decorated = reduxForm({
      asyncBlurFields: ['foo'],
      asyncValidate,
      fields: ['foo', 'bar'],
      form,
      initialValues: {
        bar: 'cat',
        foo: 'dog',
      },
    })(Form)
    const doc = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Decorated />
      </Provider>,
    )
    TestUtils.renderIntoDocument(Form)
    const stub = TestUtils.findRenderedComponentWithType(doc, Form)

    stub.props.fields.foo.onBlur('bear')
    expect(asyncValidate).toHaveBeenCalled()
  })

  it('should call async validation if form is pristine and NOT initialized', () => {
    const store = makeStore()
    const form = 'testForm'
    const errorValue = {foo: 'no bears allowed'}
    const asyncValidate = jest.fn(() => Promise.reject(errorValue))
    const Decorated = reduxForm({
      asyncBlurFields: ['foo'],
      asyncValidate,
      fields: ['foo', 'bar'],
      form,
    })(Form)
    const doc = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Decorated />
      </Provider>,
    )
    TestUtils.renderIntoDocument(Form)
    const stub = TestUtils.findRenderedComponentWithType(doc, Form)

    stub.props.fields.foo.onBlur()
    expect(asyncValidate).toHaveBeenCalled()
  })

  it('should call async validation on submit even if pristine and initialized', () => {
    const submit = jest.fn()
    class FormComponent extends React.Component {
      render() {
        return <form onSubmit={this.props.handleSubmit(submit)} />
      }
    }
    FormComponent.propTypes = {
      handleSubmit: PropTypes.func.isRequired,
    }

    const store = makeStore()
    const form = 'testForm'
    const errorValue = {foo: 'no dogs allowed'}
    const asyncValidate = jest.fn(() => Promise.reject(errorValue))
    const Decorated = reduxForm({
      asyncBlurFields: ['foo'],
      asyncValidate,
      fields: ['foo', 'bar'],
      form,
      initialValues: {
        bar: 'cat',
        foo: 'dog',
      },
    })(FormComponent)
    const doc = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Decorated />
      </Provider>,
    )
    const formElement = TestUtils.findRenderedDOMComponentWithTag(doc, 'form')

    TestUtils.Simulate.submit(formElement)

    expect(asyncValidate).toHaveBeenCalled()
    expect(submit).not.toHaveBeenCalled()
  })

  it('should call submit function passed to handleSubmit', done => {
    const submit = values => {
      expect(values).toEqual({
        bar: undefined,
        foo: undefined,
      })
      done()
    }

    class FormComponent extends React.Component {
      render() {
        return <form onSubmit={this.props.handleSubmit(submit)} />
      }
    }

    FormComponent.propTypes = {
      handleSubmit: PropTypes.func.isRequired,
    }

    const store = makeStore()
    const form = 'testForm'
    const Decorated = reduxForm({
      fields: ['foo', 'bar'],
      form,
      readonly: true,
    })(FormComponent)
    const doc = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Decorated />
      </Provider>,
    )
    const formElement = TestUtils.findRenderedDOMComponentWithTag(doc, 'form')

    TestUtils.Simulate.submit(formElement)
  })

  it('should call submit function passed to async handleSubmit', done => {
    const submit = values => {
      expect(values).toEqual({
        bar: undefined,
        foo: undefined,
      })
      return new Promise(resolve => {
        setTimeout(() => {
          resolve()
        }, 100)
      }).then(done)
    }

    class FormComponent extends React.Component {
      render() {
        return <form onSubmit={this.props.handleSubmit(submit)} />
      }
    }

    FormComponent.propTypes = {
      handleSubmit: PropTypes.func.isRequired,
    }

    const store = makeStore()
    const form = 'testForm'
    const Decorated = reduxForm({
      fields: ['foo', 'bar'],
      form,
      readonly: true,
    })(FormComponent)
    const doc = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Decorated />
      </Provider>,
    )
    const formElement = TestUtils.findRenderedDOMComponentWithTag(doc, 'form')

    TestUtils.Simulate.submit(formElement)
  })

  it('should initialize a non-array field with an array value and let it read it back', () => {
    const store = makeStore()
    const form = 'testForm'
    const Decorated = reduxForm({
      fields: ['children'],
      form,
      initialValues: {
        children: [1, 2],
      },
    })(Form)
    const doc = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Decorated />
      </Provider>,
    )
    TestUtils.renderIntoDocument(Form)
    const stub = TestUtils.findRenderedComponentWithType(doc, Form)

    expectField({
      dirty: false,
      error: undefined,
      field: stub.props.fields.children,
      initial: [1, 2],
      name: 'children',
      touched: false,
      valid: true,
      value: [1, 2],
      visited: false,
    })
  })

  it('should initialize an array field with an array value', () => {
    const store = makeStore()
    const form = 'testForm'
    const Decorated = reduxForm({
      fields: ['colors[]'],
      form,
      initialValues: {
        colors: ['red', 'blue'],
      },
    })(Form)
    const doc = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Decorated />
      </Provider>,
    )
    TestUtils.renderIntoDocument(Form)
    const stub = TestUtils.findRenderedComponentWithType(doc, Form)

    expect(stub.props.fields.colors).toBeInstanceOf(Array)
    expect(stub.props.fields.colors.length).toBe(2)
    expectField({
      dirty: false,
      error: undefined,
      field: stub.props.fields.colors[0],
      initial: 'red',
      name: 'colors[0]',
      touched: false,
      valid: true,
      value: 'red',
      visited: false,
    })
    expectField({
      dirty: false,
      error: undefined,
      field: stub.props.fields.colors[1],
      initial: 'blue',
      name: 'colors[1]',
      touched: false,
      valid: true,
      value: 'blue',
      visited: false,
    })
  })

  it('should initialize a deep array field with values', () => {
    const store = makeStore()
    const form = 'testForm'
    const Decorated = reduxForm({
      fields: ['users[].name', 'users[].age'],
      form,
      initialValues: {
        users: [
          {
            age: 27,
            name: 'Bob',
          },
        ],
      },
    })(Form)
    const doc = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Decorated />
      </Provider>,
    )
    TestUtils.renderIntoDocument(Form)
    const stub = TestUtils.findRenderedComponentWithType(doc, Form)

    expect(stub.props.fields.users).toBeInstanceOf(Array)
    expect(stub.props.fields.users.length).toBe(1)
    expect(stub.props.fields.users[0]).toBeInstanceOf(Object)
    expectField({
      dirty: false,
      error: undefined,
      field: stub.props.fields.users[0].name,
      initial: 'Bob',
      name: 'users[0].name',
      touched: false,
      valid: true,
      value: 'Bob',
      visited: false,
    })
    expectField({
      dirty: false,
      error: undefined,
      field: stub.props.fields.users[0].age,
      initial: 27,
      name: 'users[0].age',
      touched: false,
      valid: true,
      value: 27,
      visited: false,
    })
  })

  it('should add array values with defaults', () => {
    const store = makeStore()
    const form = 'testForm'
    const Decorated = reduxForm({
      fields: ['users[].name', 'users[].age'],
      form,
    })(Form)
    const doc = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Decorated />
      </Provider>,
    )
    TestUtils.renderIntoDocument(Form)
    const stub = TestUtils.findRenderedComponentWithType(doc, Form)

    expect(stub.props.fields.users).toBeInstanceOf(Array)
    expect(stub.props.fields.users.length).toBe(0)
    expect(stub.props.fields.users.addField).toBeInstanceOf(Function)

    const before = stub.props.fields.users

    // add field
    stub.props.fields.users.addField({age: 27, name: 'Bob'})

    // check field
    expect(stub.props.fields.users.length).toBe(1)
    expect(stub.props.fields.users[0]).toBeInstanceOf(Object)
    expectField({
      dirty: false,
      error: undefined,
      field: stub.props.fields.users[0].name,
      initial: 'Bob',
      name: 'users[0].name',
      touched: false,
      valid: true,
      value: 'Bob',
      visited: false,
    })
    expectField({
      dirty: false,
      error: undefined,
      field: stub.props.fields.users[0].age,
      initial: 27,
      name: 'users[0].age',
      touched: false,
      valid: true,
      value: 27,
      visited: false,
    })
    const after = stub.props.fields.users
    expect(after).not.toBe(before) // should be a new instance

    // check state
    expect(store.getState().form.testForm.users).toBeInstanceOf(Array)
    expect(store.getState().form.testForm.users.length).toBe(1)
    expect(store.getState().form.testForm.users[0].name).toEqual({
      initial: 'Bob',
      value: 'Bob',
    })
    expect(store.getState().form.testForm.users[0].age).toEqual({
      initial: 27,
      value: 27,
    })
  })

  // Test to demonstrate bug: https://github.com/erikras/redux-form/issues/630
  it('should add array values when root is not an array', () => {
    const store = makeStore()
    const form = 'testForm'
    const Decorated = reduxForm({
      fields: ['acknowledgements.items[].number', 'acknowledgements.items[].name', 'acknowledgements.show'],
      form,
    })(Form)
    const doc = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Decorated />
      </Provider>,
    )
    TestUtils.renderIntoDocument(Form)
    const stub = TestUtils.findRenderedComponentWithType(doc, Form)

    expect(stub.props.fields.acknowledgements).toBeInstanceOf(Object)
    expect(stub.props.fields.acknowledgements.items).toBeInstanceOf(Array)
    expect(stub.props.fields.acknowledgements.items.length).toBe(0)
    expect(stub.props.fields.acknowledgements.items.addField).toBeInstanceOf(Function)

    // add field
    stub.props.fields.acknowledgements.items.addField({
      name: 'foo',
      number: 1,
    })

    // check field
    expect(stub.props.fields.acknowledgements.items.length).toBe(1)
    expect(stub.props.fields.acknowledgements.items[0]).toBeInstanceOf(Object)
    expectField({
      dirty: false,
      error: undefined,
      field: stub.props.fields.acknowledgements.items[0].number,
      initial: 1,
      name: 'acknowledgements.items[0].number',
      touched: false,
      valid: true,
      value: 1,
      visited: false,
    })
    expectField({
      dirty: false,
      error: undefined,
      field: stub.props.fields.acknowledgements.items[0].name,
      initial: 'foo',
      name: 'acknowledgements.items[0].name',
      touched: false,
      valid: true,
      value: 'foo',
      visited: false,
    })
  })

  // Test to demonstrate bug: https://github.com/erikras/redux-form/issues/468
  it('should add array values with DEEP defaults', () => {
    const store = makeStore()
    const form = 'testForm'
    const Decorated = reduxForm({
      fields: [
        'proposals[].arrival',
        'proposals[].departure',
        'proposals[].note',
        'proposals[].rooms[].name',
        'proposals[].rooms[].adults',
        'proposals[].rooms[].children',
      ],
      form,
    })(Form)
    const doc = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Decorated />
      </Provider>,
    )
    TestUtils.renderIntoDocument(Form)
    const stub = TestUtils.findRenderedComponentWithType(doc, Form)

    expect(stub.props.fields.proposals).toBeInstanceOf(Array)
    expect(stub.props.fields.proposals.length).toBe(0)
    expect(stub.props.fields.proposals.addField).toBeInstanceOf(Function)

    // add field
    const today = new Date()
    stub.props.fields.proposals.addField({
      arrival: today,
      departure: today,
      note: '',
      rooms: [
        {
          adults: 2,
          children: 0,
          name: 'Room 1',
        },
      ],
    })

    stub.props.fields.proposals[0].rooms.addField({
      adults: 0,
      children: 2,
      name: 'Room 2',
    })

    // check field
    expect(stub.props.fields.proposals.length).toBe(1)
    expect(stub.props.fields.proposals[0]).toBeInstanceOf(Object)
    expectField({
      dirty: false,
      error: undefined,
      field: stub.props.fields.proposals[0].arrival,
      initial: today,
      name: 'proposals[0].arrival',
      touched: false,
      valid: true,
      value: today,
      visited: false,
    })
    expectField({
      dirty: false,
      error: undefined,
      field: stub.props.fields.proposals[0].departure,
      initial: today,
      name: 'proposals[0].departure',
      touched: false,
      valid: true,
      value: today,
      visited: false,
    })
    expectField({
      dirty: false,
      error: undefined,
      field: stub.props.fields.proposals[0].note,
      initial: '',
      name: 'proposals[0].note',
      touched: false,
      valid: true,
      value: '',
      visited: false,
    })
    expectField({
      dirty: false,
      error: undefined,
      field: stub.props.fields.proposals[0].rooms[0].name,
      initial: 'Room 1',
      name: 'proposals[0].rooms[0].name',
      touched: false,
      valid: true,
      value: 'Room 1',
      visited: false,
    })
    expectField({
      dirty: false,
      error: undefined,
      field: stub.props.fields.proposals[0].rooms[0].adults,
      initial: 2,
      name: 'proposals[0].rooms[0].adults',
      touched: false,
      valid: true,
      value: 2,
      visited: false,
    })
    expectField({
      dirty: false,
      error: undefined,
      field: stub.props.fields.proposals[0].rooms[0].children,
      initial: 0,
      name: 'proposals[0].rooms[0].children',
      touched: false,
      valid: true,
      value: 0,
      visited: false,
    })
    expectField({
      dirty: false,
      error: undefined,
      field: stub.props.fields.proposals[0].rooms[1].name,
      initial: 'Room 2',
      name: 'proposals[0].rooms[1].name',
      touched: false,
      valid: true,
      value: 'Room 2',
      visited: false,
    })
    expectField({
      dirty: false,
      error: undefined,
      field: stub.props.fields.proposals[0].rooms[1].adults,
      initial: 0,
      name: 'proposals[0].rooms[1].adults',
      touched: false,
      valid: true,
      value: 0,
      visited: false,
    })
    expectField({
      dirty: false,
      error: undefined,
      field: stub.props.fields.proposals[0].rooms[1].children,
      initial: 2,
      name: 'proposals[0].rooms[1].children',
      touched: false,
      valid: true,
      value: 2,
      visited: false,
    })
  })

  // Test to demonstrate https://github.com/erikras/redux-form/issues/612
  //it('should work with a root-level array field', () => {
  //  const store = makeStore();
  //  const form = 'testForm';
  //  const Decorated = reduxForm({
  //    form,
  //    fields: ['tags[]']
  //  })(Form);
  //  const doc = TestUtils.renderIntoDocument(
  //    <Provider store={store}>
  //      <Decorated/>
  //    </Provider>
  //  );
  //  const stub = TestUtils.renderIntoDocument(Form);
  //
  //  expect(stub.props.fields.tags).toBeInstanceOf(Array);
  //  expect(stub.props.fields.tags.length).toBe(0);
  //  expect(stub.props.fields.tags.addField).toBeInstanceOf(Function);
  //
  //  // add field
  //  stub.props.fields.proposals.addField('foo');
  //
  //  // check field
  //  expect(stub.props.fields.tags.length).toBe(1);
  //  expect(stub.props.fields.tags[0]).toBeInstanceOf(Object);
  //  expectField({
  //    field: stub.props.fields.tags[0],
  //    name: 'tags[0]',
  //    value: 'foo',
  //    initial: 'foo',
  //    valid: true,
  //    dirty: false,
  //    error: undefined,
  //    touched: false,
  //    visited: false
  //  });
  //});

  it('should initialize an array field, blowing away existing value', () => {
    const store = makeStore()
    const form = 'testForm'
    const Decorated = reduxForm({
      fields: ['children'],
      form,
    })(Form)
    const doc = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Decorated />
      </Provider>,
    )
    TestUtils.renderIntoDocument(Form)
    const stub = TestUtils.findRenderedComponentWithType(doc, Form)

    // set value
    stub.props.fields.children.onChange([1, 2])
    // check value
    expectField({
      dirty: true,
      error: undefined,
      field: stub.props.fields.children,
      initial: undefined,
      name: 'children',
      touched: false,
      valid: true,
      value: [1, 2],
      visited: false,
    })
    // initialize new values
    stub.props.initializeForm({children: [3, 4]})
    // check value
    expectField({
      dirty: false,
      error: undefined,
      field: stub.props.fields.children,
      initial: [3, 4],
      name: 'children',
      touched: false,
      valid: true,
      value: [3, 4],
      visited: false,
    })
    // check state
    expect(store.getState().form.testForm.children).toEqual({
      initial: [3, 4],
      value: [3, 4],
    })
    // reset form to newly initialized values
    stub.props.resetForm()
    // check value
    expectField({
      dirty: false,
      error: undefined,
      field: stub.props.fields.children,
      initial: [3, 4],
      name: 'children',
      touched: false,
      valid: true,
      value: [3, 4],
      visited: false,
    })
  })

  it('should only initialize on mount once', () => {
    const store = makeStore()
    const form = 'testForm'
    const Decorated = reduxForm({
      fields: ['name'],
      form,
    })(Form)
    const doc1 = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Decorated initialValues={{name: 'Bob'}} />
      </Provider>,
    )
    const stub = TestUtils.findRenderedComponentWithType(doc1, Form)

    // check value
    expectField({
      dirty: false,
      error: undefined,
      field: stub.props.fields.name,
      initial: 'Bob',
      name: 'name',
      touched: false,
      valid: true,
      value: 'Bob',
      visited: false,
    })
    // check state
    expect(store.getState().form.testForm.name).toEqual({
      initial: 'Bob',
      value: 'Bob',
    })
    // set value
    stub.props.fields.name.onChange('Dan')
    // check value
    expectField({
      dirty: true,
      error: undefined,
      field: stub.props.fields.name,
      initial: 'Bob',
      name: 'name',
      touched: false,
      valid: true,
      value: 'Dan',
      visited: false,
    })
    // check state
    expect(store.getState().form.testForm.name).toEqual({
      initial: 'Bob',
      value: 'Dan',
    })

    // should NOT dispatch INITIALIZE this time
    const doc2 = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Decorated initialValues={{name: 'Bob'}} />
      </Provider>,
    )
    const stub2 = TestUtils.findRenderedComponentWithType(doc2, Form)
    // check that value is unchanged
    expectField({
      dirty: true,
      error: undefined,
      field: stub2.props.fields.name,
      initial: 'Bob',
      name: 'name',
      touched: false,
      valid: true,
      value: 'Dan',
      visited: false,
    })
    // check state
    expect(store.getState().form.testForm.name).toEqual({
      initial: 'Bob',
      value: 'Dan',
    })

    // manually initialize new values
    stub2.props.initializeForm({name: 'Tom'})
    // check value
    expectField({
      dirty: false,
      error: undefined,
      field: stub2.props.fields.name,
      initial: 'Tom',
      name: 'name',
      touched: false,
      valid: true,
      value: 'Tom',
      visited: false,
    })
    // check state
    expect(store.getState().form.testForm.name).toEqual({
      initial: 'Tom',
      value: 'Tom',
    })
  })

  it('should allow initialization from action', () => {
    const store = makeStore()
    const form = 'testForm'
    const Decorated = reduxForm({
      fields: ['name'],
      form,
    })(Form)
    const doc = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Decorated />
      </Provider>,
    )
    TestUtils.renderIntoDocument(Form)
    const stub = TestUtils.findRenderedComponentWithType(doc, Form)

    // check value
    expectField({
      dirty: false,
      error: undefined,
      field: stub.props.fields.name,
      initial: undefined,
      name: 'name',
      touched: false,
      valid: true,
      value: undefined,
      visited: false,
    })
    // manually initialize new values
    stub.props.initializeForm({name: 'Tom'})
    // check state
    expect(store.getState().form.testForm.name).toEqual({
      initial: 'Tom',
      value: 'Tom',
    })
    // check value
    expectField({
      dirty: false,
      error: undefined,
      field: stub.props.fields.name,
      initial: 'Tom',
      name: 'name',
      touched: false,
      valid: true,
      value: 'Tom',
      visited: false,
    })
  })

  it('should allow deep sync validation error values', () => {
    const store = makeStore()
    const form = 'testForm'
    const deepError = {
      deep: 'values',
      some: 'object with',
    }
    const Decorated = reduxForm({
      fields: ['name'],
      form,
      validate: () => ({name: deepError}),
    })(Form)
    const doc = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Decorated />
      </Provider>,
    )
    TestUtils.renderIntoDocument(Form)
    const stub = TestUtils.findRenderedComponentWithType(doc, Form)

    expectField({
      dirty: false,
      error: deepError,
      field: stub.props.fields.name,
      initial: undefined,
      name: 'name',
      touched: false,
      valid: false,
      value: undefined,
      visited: false,
    })
  })

  it('should allow deep async validation error values', () => {
    const store = makeStore()
    const form = 'testForm'
    const deepError = {
      deep: 'values',
      some: 'object with',
    }
    const Decorated = reduxForm({
      asyncValidate: () => Promise.reject({name: deepError}),
      fields: ['name'],
      form,
      initialValues: {name: 'Tom'},
    })(Form)
    const doc = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Decorated />
      </Provider>,
    )
    TestUtils.renderIntoDocument(Form)
    const stub = TestUtils.findRenderedComponentWithType(doc, Form)

    // check field before validation
    expectField({
      dirty: false,
      error: undefined,
      field: stub.props.fields.name,
      initial: 'Tom',
      name: 'name',
      touched: false,
      valid: true,
      value: 'Tom',
      visited: false,
    })

    // form must be dirty for asyncValidate()
    stub.props.fields.name.onChange('Moe')

    return stub.props.asyncValidate().then(
      () => {
        expect(true).toBe(false) // should not be in success block
      },
      () => {
        // check state
        expect(store.getState().form.testForm.name).toEqual({
          asyncError: deepError,
          initial: 'Tom',
          value: 'Moe',
        })
        // check field
        expectField({
          dirty: true,
          error: deepError,
          field: stub.props.fields.name,
          initial: 'Tom',
          name: 'name',
          touched: false,
          valid: false,
          value: 'Moe',
          visited: false,
        })
      },
    )
  })

  it('should allow deep submit validation error values', () => {
    const store = makeStore()
    const form = 'testForm'
    const deepError = {
      deep: 'values',
      some: 'object with',
    }
    const Decorated = reduxForm({
      fields: ['name'],
      form,
      initialValues: {name: 'Tom'},
      onSubmit: () => Promise.reject({name: deepError}),
    })(Form)
    const doc = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Decorated />
      </Provider>,
    )
    TestUtils.renderIntoDocument(Form)
    const stub = TestUtils.findRenderedComponentWithType(doc, Form)

    // check before validation
    expectField({
      dirty: false,
      error: undefined,
      field: stub.props.fields.name,
      initial: 'Tom',
      name: 'name',
      touched: false,
      valid: true,
      value: 'Tom',
      visited: false,
    })
    return stub.props.handleSubmit().then(() => {
      // check state
      expect(store.getState().form.testForm.name).toEqual({
        initial: 'Tom',
        submitError: deepError,
        touched: true,
        value: 'Tom',
      })
      // check field
      expectField({
        dirty: false,
        error: deepError,
        field: stub.props.fields.name,
        initial: 'Tom',
        name: 'name',
        touched: true,
        valid: false,
        value: 'Tom',
        visited: false,
      })
    })
  })

  it('should only mutate the field that changed', () => {
    const store = makeStore()
    const form = 'testForm'
    const Decorated = reduxForm({
      fields: ['larry', 'moe', 'curly'],
      form,
    })(Form)
    const doc = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Decorated />
      </Provider>,
    )
    TestUtils.renderIntoDocument(Form)
    const stub = TestUtils.findRenderedComponentWithType(doc, Form)

    const larry = stub.props.fields.larry
    const moe = stub.props.fields.moe
    const curly = stub.props.fields.curly

    moe.onChange('BONK!')

    expect(stub.props.fields.larry).toBe(larry)
    expect(stub.props.fields.moe).not.toBe(moe)
    expect(stub.props.fields.curly).toBe(curly)
  })

  it('should only change the deep field that changed', () => {
    const store = makeStore()
    const form = 'testForm'
    const Decorated = reduxForm({
      fields: ['address.street', 'address.postalCode'],
      form,
    })(Form)
    const doc = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Decorated />
      </Provider>,
    )
    TestUtils.renderIntoDocument(Form)
    const stub = TestUtils.findRenderedComponentWithType(doc, Form)

    const address = stub.props.fields.address
    const street = stub.props.fields.address.street
    const postalCode = stub.props.fields.address.postalCode

    postalCode.onChange('90210')

    expect(stub.props.fields.address).not.toBe(address)
    expect(stub.props.fields.address.street).toBe(street)
    expect(stub.props.fields.address.postalCode).not.toBe(postalCode)
  })

  it('should change field tree up to array that changed', () => {
    const store = makeStore()
    const form = 'testForm'
    const Decorated = reduxForm({
      fields: ['contact.shipping.phones[]', 'contact.billing.phones[]'],
      form,
    })(Form)
    const doc = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Decorated />
      </Provider>,
    )
    TestUtils.renderIntoDocument(Form)
    const stub = TestUtils.findRenderedComponentWithType(doc, Form)

    let contact = stub.props.fields.contact
    let shipping = stub.props.fields.contact.shipping
    let shippingPhones = stub.props.fields.contact.shipping.phones
    const billing = stub.props.fields.contact.billing
    const billingPhones = stub.props.fields.contact.billing.phones

    shippingPhones.addField()

    expect(stub.props.fields.contact.shipping.phones).not.toBe(shippingPhones)
    expect(stub.props.fields.contact.shipping).not.toBe(shipping)
    expect(stub.props.fields.contact).not.toBe(contact)
    expect(stub.props.fields.contact.billing).toBe(billing)
    expect(stub.props.fields.contact.billing.phones).toBe(billingPhones)

    contact = stub.props.fields.contact
    shipping = stub.props.fields.contact.shipping
    shippingPhones = stub.props.fields.contact.shipping.phones
    const shippingPhones0 = stub.props.fields.contact.shipping.phones[0]

    shippingPhones[0].onChange('555-1234')

    expect(stub.props.fields.contact.shipping.phones[0]).not.toBe(shippingPhones0)
    expect(stub.props.fields.contact.shipping.phones).not.toBe(shippingPhones)
    expect(stub.props.fields.contact.shipping).not.toBe(shipping)
    expect(stub.props.fields.contact).not.toBe(contact)
    expect(stub.props.fields.contact.billing).toBe(billing)
    expect(stub.props.fields.contact.billing.phones).toBe(billingPhones)
  })

  it('should provide a submit() method to submit the form', () => {
    const store = makeStore()
    const form = 'testForm'
    const initialValues = {age: 12, firstName: 'Bobby', lastName: 'Tables'}
    const onSubmit = jest.fn(() => Promise.resolve())
    const Decorated = reduxForm({
      fields: ['firstName', 'lastName', 'age'],
      form,
      initialValues,
      onSubmit,
    })(Form)

    class Container extends React.Component {
      constructor(props) {
        super(props)
        this.submitFromParent = this.submitFromParent.bind(this)
      }

      submitFromParent() {
        this.refs.myForm.submit()
      }

      render() {
        return (
          <div>
            <Decorated ref="myForm" />
            <button onClick={this.submitFromParent} type="button">
              Submit From Parent
            </button>
          </div>
        )
      }
    }

    const doc = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Container />
      </Provider>,
    )

    const button = TestUtils.findRenderedDOMComponentWithTag(doc, 'button')

    expect(onSubmit).not.toHaveBeenCalled()

    TestUtils.Simulate.click(button)

    expect(onSubmit).toHaveBeenCalled()
    expect(onSubmit).toHaveBeenCalledWith(initialValues, store.dispatch)
  })

  it('submitting from parent should fail if sync validation errors', () => {
    const store = makeStore()
    const form = 'testForm'
    const initialValues = {age: 12, firstName: 'Bobby', lastName: 'Tables'}
    const onSubmit = jest.fn(() => Promise.resolve())
    const validate = jest.fn(() => ({firstName: 'Go to your room, Bobby.'}))
    const Decorated = reduxForm({
      fields: ['firstName', 'lastName', 'age'],
      form,
      initialValues,
      onSubmit,
      validate,
    })(Form)

    class Container extends React.Component {
      constructor(props) {
        super(props)
        this.submitFromParent = this.submitFromParent.bind(this)
      }

      submitFromParent() {
        this.refs.myForm.submit()
      }

      render() {
        return (
          <div>
            <Decorated ref="myForm" />
            <button onClick={this.submitFromParent} type="button">
              Submit From Parent
            </button>
          </div>
        )
      }
    }

    const doc = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Container />
      </Provider>,
    )

    const button = TestUtils.findRenderedDOMComponentWithTag(doc, 'button')

    expect(onSubmit).not.toHaveBeenCalled()

    TestUtils.Simulate.click(button)

    expect(validate).toHaveBeenCalled()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('should only rerender the form that changed', () => {
    const store = makeStore()
    const fooRender = jest.fn(() => <div />)
    const barRender = jest.fn(() => <div />)

    class FooForm extends React.Component {
      render() {
        return fooRender()
      }
    }

    class BarForm extends React.Component {
      render() {
        return barRender()
      }
    }

    const DecoratedFooForm = reduxForm({
      fields: ['name'],
      form: 'foo',
    })(FooForm)
    const DecoratedBarForm = reduxForm({
      fields: ['name'],
      form: 'bar',
    })(BarForm)

    const doc = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <div>
          <DecoratedFooForm />
          <DecoratedBarForm />
        </div>
      </Provider>,
    )
    TestUtils.renderIntoDocument(FooForm)
    const fooStub = TestUtils.findRenderedComponentWithType(doc, FooForm)

    // first render
    expect(fooRender).toHaveBeenCalled()
    expect(barRender).toHaveBeenCalled()

    // restore spies
    fooRender.mockClear()
    barRender.mockClear()

    // change field on foo
    fooStub.props.fields.name.onChange('Tom')

    // second render: only foo form
    expect(fooRender).toHaveBeenCalled()
    expect(barRender).not.toHaveBeenCalled()
  })

  it('should only rerender the field components that change', () => {
    const store = makeStore()
    let fooRenders = 0
    let barRenders = 0

    class FooInput extends React.Component {
      shouldComponentUpdate(nextProps) {
        return this.props.field !== nextProps.field
      }

      render() {
        fooRenders++
        const {field} = this.props
        return <input type="text" {...field} />
      }
    }
    FooInput.propTypes = {
      field: PropTypes.object.isRequired,
    }

    class BarInput extends React.Component {
      shouldComponentUpdate(nextProps) {
        return this.props.field !== nextProps.field
      }

      render() {
        barRenders++
        const {field} = this.props
        return <input type="password" {...field} />
      }
    }
    BarInput.propTypes = {
      field: PropTypes.object.isRequired,
    }

    class FieldTestForm extends React.Component {
      render() {
        const {
          fields: {foo, bar},
        } = this.props
        return (
          <div>
            <FooInput field={foo} />
            <BarInput field={bar} />
          </div>
        )
      }
    }
    FieldTestForm.propTypes = {
      fields: PropTypes.object.isRequired,
    }

    const DecoratedForm = reduxForm({
      fields: ['foo', 'bar'],
      form: 'fieldTest',
    })(FieldTestForm)

    const doc = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <DecoratedForm />
      </Provider>,
    )

    TestUtils.renderIntoDocument(FieldTestForm)
    const stub = TestUtils.findRenderedComponentWithType(doc, FieldTestForm)

    // first render
    expect(fooRenders).toBe(1)
    expect(barRenders).toBe(1)

    // change field foo
    stub.props.fields.foo.onChange('Tom')

    // second render, only foo should rerender
    expect(fooRenders).toBe(2)
    expect(barRenders).toBe(1)

    // change field bar
    stub.props.fields.bar.onChange('Jerry')

    // third render, only bar should rerender
    expect(fooRenders).toBe(2)
    expect(barRenders).toBe(2)
  })

  // Test to show bug https://github.com/erikras/redux-form/issues/550
  // ---
  // It's caused by the fact that we're no longer using the same field instance
  // throughout the lifetime of the component. Since the fields are immutable now,
  // the field.value given to createOnDragStart() no longer refers to the current
  // value.
  // ---
  //it('should drag the current value', () => {
  //  const store = makeStore();
  //  const form = 'testForm';
  //  const Decorated = reduxForm({
  //    form,
  //    fields: ['name']
  //  })(Form);
  //  const doc = TestUtils.renderIntoDocument(
  //    <Provider store={store}>
  //      <Decorated/>
  //    </Provider>
  //  );
  //  const stub = TestUtils.renderIntoDocument(Form);
  //
  //  stub.props.fields.name.onChange('FOO');
  //  const setData = createSpy();
  //  stub.props.fields.name.onDragStart({dataTransfer: {setData}});
  //
  //  expect(setData)
  //    .toHaveBeenCalled()
  //    .toHaveBeenCalledWith('value', 'FOO');
  //});

  // Test to show bug https://github.com/erikras/redux-form/issues/629
  // ---
  // It's caused by the fact that RESET is just copying values from initial to value,
  // but what it needs to do is blow away the whole state tree and re-initialize it
  // with the initial values.
  // ---
  //it('resetting the form should reset array fields', () => {
  //  const store = makeStore();
  //  const form = 'testForm';
  //  const Decorated = reduxForm({
  //    form,
  //    fields: ['kennel', 'dogs[].name', 'dogs[].breed']
  //  })(Form);
  //  const doc = TestUtils.renderIntoDocument(
  //    <Provider store={store}>
  //      <Decorated initialValues={{
  //        kennel: 'Bob\'s Dog House',
  //        dogs: [
  //          {name: 'Fido', breed: 'Pit Bull'},
  //          {name: 'Snoopy', breed: 'Beagle'},
  //          {name: 'Scooby Doo', breed: 'Great Dane'}
  //        ]
  //      }}/>
  //    </Provider>
  //  );
  //  const stub = TestUtils.renderIntoDocument(Form);
  //
  //  expect(stub.props.fields.dogs.length).toBe(3);
  //
  //  stub.props.fields.dogs.addField({name: 'Lassie', breed: 'Collie'});
  //
  //  expect(stub.props.fields.dogs.length).toBe(4);
  //
  //  stub.props.resetForm();
  //
  //  expect(stub.props.fields.dogs.length).toBe(3);
  //});

  // Test to show bug https://github.com/erikras/redux-form/issues/621
  // ---
  // It's caused by the fact that we are letting the initialValues prop override
  // the data from the store for the initialValue and defaultValue props, but NOT for
  // value. So the value prop does not get populated until the second render.
  // ---
  //it('initial values should be present on first render', () => {
  //  const store = makeStore();
  //  const form = 'testForm';
  //  class InitialValuesTestForm extends React.Component {
  //    render() {
  //      const {fields: {name}} = this.props;
  //      expect(name.initialValue).toBe('Bob');
  //      expect(name.defaultValue).toBe('Bob');
  //      expect(name.value).toBe('Bob');
  //      return (<div>
  //        <input {...name}/>
  //      </div>);
  //    }
  //  }
  //  const Decorated = reduxForm({
  //    form,
  //    fields: ['name']
  //  })(InitialValuesTestForm);
  //  const doc = TestUtils.renderIntoDocument(
  //    <Provider store={store}>
  //      <Decorated initialValues={{name: 'Bob'}}/>
  //    </Provider>
  //  );
  //});
})
