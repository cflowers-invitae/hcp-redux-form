const createPropTypes = ({PropTypes: {any, bool, string, func, object}}) => ({
  // State:
  active: string, // currently active field
  asyncValidating: bool.isRequired, // true if async validation is running
  dirty: bool.isRequired,
  // the values of the form as they will be submitted
  // Actions:
  asyncValidate: func.isRequired,

  // true if any values are different from initialValues
  error: any,
  // form-wide error from '_error' key in validation result
  errors: object,

  // function to trigger async validation
  destroyForm: func.isRequired,

  // a map of errors corresponding to structure of form data (result of validation)
  fields: object.isRequired,

  // the map of fields
  formKey: any,

  // action to destroy the form's data in Redux
  handleSubmit: func.isRequired,

  // the form key if one was provided (used when doing multirecord forms)
  invalid: bool.isRequired,

  // true if there are any validation errors
  pristine: bool.isRequired,

  // function to submit the form
  initializeForm: func.isRequired,

  // true if the form is in the process of being submitted
  submitFailed: bool.isRequired,

  // true if the values are the same as initialValues
  submitting: bool.isRequired,

  // action to initialize form data
  resetForm: func.isRequired,

  // action to reset the form data to previously initialized values
  touch: func.isRequired,

  // true if the form was submitted and failed for any reason
  valid: bool.isRequired,

  // action to mark fields as touched
  touchAll: func.isRequired,

  // action to mark ALL fields as touched
  untouch: func.isRequired,

  // action to mark fields as untouched
  untouchAll: func.isRequired,
  // true if there are no validation errors
  values: object.isRequired, // action to mark ALL fields as untouched
})

export default createPropTypes
