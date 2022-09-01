import deepEqual from 'deep-equal'

import * as importedActions from './actions'
import asyncValidation from './asyncValidation'
import bindActionData from './bindActionData'
import silenceEvent from './events/silenceEvent'
import silenceEvents from './events/silenceEvents'
import getDisplayName from './getDisplayName'
import getValues from './getValues'
import handleSubmit from './handleSubmit'
import isValid from './isValid'
import readFields from './readFields'
import {initialState} from './reducer'
import wrapMapDispatchToProps from './wrapMapDispatchToProps'
import wrapMapStateToProps from './wrapMapStateToProps'

/**
 * Creates a HOC that knows how to create redux-connected sub-components.
 */
const createHigherOrderComponent = (
  config,
  isReactNative,
  React,
  PropTypes,
  connect,
  WrappedComponent,
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
  options,
) => {
  const {Component} = React
  return (reduxMountPoint, formName, formKey, getFormState) => {
    class ReduxForm extends Component {
      constructor(props) {
        super(props)
        // bind functions
        this.asyncValidate = this.asyncValidate.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.fields = readFields(props, {}, {}, this.asyncValidate, isReactNative)
        const {submitPassback} = this.props
        submitPassback(() => this.handleSubmit()) // wrapped in function to disallow params
      }

      UNSAFE_componentWillMount() {
        const {fields, form, initialize, initialValues} = this.props
        if (initialValues && !form._initialized) {
          initialize(initialValues, fields)
        }
      }

      UNSAFE_componentWillReceiveProps(nextProps) {
        if (
          !deepEqual(this.props.fields, nextProps.fields) ||
          !deepEqual(this.props.form, nextProps.form, {strict: true})
        ) {
          this.fields = readFields(nextProps, this.props, this.fields, this.asyncValidate, isReactNative)
        }
        if (!deepEqual(this.props.initialValues, nextProps.initialValues)) {
          this.props.initialize(nextProps.initialValues, nextProps.fields)
        }
      }

      componentWillUnmount() {
        if (config.destroyOnUnmount) {
          this.props.destroy()
        }
      }

      asyncValidate(name, value) {
        const {asyncValidate, dispatch, fields, form, startAsyncValidation, stopAsyncValidation, validate} = this.props
        const isSubmitting = !name
        if (asyncValidate) {
          const values = getValues(fields, form)
          if (name) {
            values[name] = value
          }
          const syncErrors = validate(values, this.props)
          const {allPristine} = this.fields._meta
          const initialized = form._initialized

          // if blur validating, only run async validate if sync validation passes
          // and submitting (not blur validation) or form is dirty or form was never initialized
          const syncValidationPasses = isSubmitting || isValid(syncErrors[name])
          if (syncValidationPasses && (isSubmitting || !allPristine || !initialized)) {
            return asyncValidation(
              () => asyncValidate(values, dispatch, this.props),
              startAsyncValidation,
              stopAsyncValidation,
              name,
            )
          }
        }
      }

      handleSubmit(submitOrEvent) {
        const {onSubmit, fields, form} = this.props
        const check = submit => {
          if (!submit || typeof submit !== 'function') {
            throw new Error('You must either pass handleSubmit() an onSubmit function or pass onSubmit as a prop')
          }
          return submit
        }
        return !submitOrEvent || silenceEvent(submitOrEvent)
          ? // submitOrEvent is an event: fire submit
            handleSubmit(check(onSubmit), getValues(fields, form), this.props, this.asyncValidate)
          : // submitOrEvent is the submit function: return deferred submit thunk
            silenceEvents(() =>
              handleSubmit(check(submitOrEvent), getValues(fields, form), this.props, this.asyncValidate),
            )
      }

      render() {
        const allFields = this.fields
        const {
          addArrayValue,
          asyncBlurFields,
          blur,
          change,
          destroy,
          focus,
          fields,
          form,
          initialValues,
          initialize,
          onSubmit,
          propNamespace,
          reset,
          removeArrayValue,
          returnRejectedSubmitPromise,
          startAsyncValidation,
          startSubmit,
          stopAsyncValidation,
          stopSubmit,
          submitFailed,
          swapArrayValues,
          touch,
          untouch,
          validate,
          ...passableProps
        } = this.props
        const {allPristine, allValid, errors, formError, values} = allFields._meta

        const props = {
          // State:
          active: form._active,
          asyncValidating: form._asyncValidating,
          dirty: !allPristine,
          // Actions:
          asyncValidate: silenceEvents(() => this.asyncValidate()),

          error: formError,

          errors,

          // ^ doesn't just pass this.asyncValidate to disallow values passing
          destroyForm: silenceEvents(destroy),

          fields: allFields,

          formKey,

          handleSubmit: this.handleSubmit,

          invalid: !allValid,

          initializeForm: silenceEvents(initValues => initialize(initValues, fields)),

          pristine: allPristine,

          resetForm: silenceEvents(reset),

          submitFailed: form._submitFailed,
          submitting: form._submitting,
          touch: silenceEvents((...touchFields) => touch(...touchFields)),
          touchAll: silenceEvents(() => touch(...fields)),
          untouch: silenceEvents((...untouchFields) => untouch(...untouchFields)),
          valid: allValid,
          untouchAll: silenceEvents(() => untouch(...fields)),
          values,
        }
        const passedProps = propNamespace ? {[propNamespace]: props} : props
        return (
          <WrappedComponent
            {...{
              ...passableProps, // contains dispatch
              ...passedProps,
            }}
          />
        )
      }
    }
    ReduxForm.displayName = `ReduxForm(${getDisplayName(WrappedComponent)})`
    ReduxForm.WrappedComponent = WrappedComponent
    ReduxForm.propTypes = {
      // props:
      asyncBlurFields: PropTypes.arrayOf(PropTypes.string),
      asyncValidate: PropTypes.func,
      // actions:
      addArrayValue: PropTypes.func.isRequired,

      dispatch: PropTypes.func.isRequired,

      fields: PropTypes.arrayOf(PropTypes.string).isRequired,

      blur: PropTypes.func.isRequired,

      form: PropTypes.object,

      change: PropTypes.func.isRequired,

      initialValues: PropTypes.any,

      destroy: PropTypes.func.isRequired,

      onSubmit: PropTypes.func,

      focus: PropTypes.func.isRequired,

      propNamespace: PropTypes.string,
      initialize: PropTypes.func.isRequired,
      readonly: PropTypes.bool,
      removeArrayValue: PropTypes.func.isRequired,
      returnRejectedSubmitPromise: PropTypes.bool,
      reset: PropTypes.func.isRequired,
      submitPassback: PropTypes.func.isRequired,
      startAsyncValidation: PropTypes.func.isRequired,
      startSubmit: PropTypes.func.isRequired,
      validate: PropTypes.func,
      stopAsyncValidation: PropTypes.func.isRequired,
      stopSubmit: PropTypes.func.isRequired,
      submitFailed: PropTypes.func.isRequired,
      swapArrayValues: PropTypes.func.isRequired,
      touch: PropTypes.func.isRequired,
      untouch: PropTypes.func.isRequired,
    }
    ReduxForm.defaultProps = {
      asyncBlurFields: [],
      form: initialState,
      readonly: false,
      returnRejectedSubmitPromise: false,
      validate: () => ({}),
    }

    // bind touch flags to blur and change
    const unboundActions = {
      ...importedActions,
      blur: bindActionData(importedActions.blur, {
        touch: !!config.touchOnBlur,
      }),
      change: bindActionData(importedActions.change, {
        touch: !!config.touchOnChange,
      }),
    }

    // make redux connector with or without form key
    const decorate =
      formKey !== undefined && formKey !== null
        ? connect(
            wrapMapStateToProps(mapStateToProps, state => {
              const formState = getFormState(state, reduxMountPoint)
              if (!formState) {
                throw new Error(`You need to mount the redux-form reducer at "${reduxMountPoint}"`)
              }
              return formState && formState[formName] && formState[formName][formKey]
            }),
            wrapMapDispatchToProps(
              mapDispatchToProps,
              bindActionData(unboundActions, {
                form: formName,
                key: formKey,
              }),
            ),
            mergeProps,
            options,
          )
        : connect(
            wrapMapStateToProps(mapStateToProps, state => {
              const formState = getFormState(state, reduxMountPoint)
              if (!formState) {
                throw new Error(`You need to mount the redux-form reducer at "${reduxMountPoint}"`)
              }
              return formState && formState[formName]
            }),
            wrapMapDispatchToProps(mapDispatchToProps, bindActionData(unboundActions, {form: formName})),
            mergeProps,
            options,
          )

    return decorate(ReduxForm)
  }
}

export default createHigherOrderComponent
