import getValues from './getValues'
import readField from './readField'
import removeField from './removeField'
import write from './write'

/**
 * Reads props and generates (or updates) field structure
 */
const readFields = (props, previousProps, myFields, asyncValidate, isReactNative) => {
  const {fields, form, validate} = props
  const previousFields = previousProps.fields
  const values = getValues(fields, form)
  const syncErrors = validate(values, props)
  let errors = {}
  const formError = syncErrors._error || form._error
  let allValid = !formError
  let allPristine = true
  const tally = field => {
    if (field.error) {
      errors = write(field.name, field.error, errors)
      allValid = false
    }
    if (field.dirty) {
      allPristine = false
    }
  }
  const fieldObjects = previousFields
    ? previousFields.reduce(
        (accumulator, previousField) =>
          ~fields.indexOf(previousField) ? accumulator : removeField(accumulator, previousField),
        {...myFields},
      )
    : {...myFields}
  fields.forEach(name => {
    readField(form, name, undefined, fieldObjects, syncErrors, asyncValidate, isReactNative, props, tally)
  })
  Object.defineProperty(fieldObjects, '_meta', {
    value: {
      allPristine,
      allValid,
      errors,
      formError,
      values,
    },
  })
  return fieldObjects
}
export default readFields
