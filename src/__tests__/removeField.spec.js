import expect from 'expect'

import removeField from '../removeField'

describe('removeField', () => {
  it('should have no effect if simple field does not exist', () => {
    expect(removeField({foo: 'bar'}, 'baz')).toEqual({foo: 'bar'})
  })

  it('should not return same instance', () => {
    const fields = {foo: 'bar'}
    expect(removeField(fields, 'foo')).toNotBe(fields)
  })

  it('should remove a simple field', () => {
    expect(removeField({dog: 42, foo: 'bar'}, 'dog')).toEqual({foo: 'bar'})
  })

  it('should remove a nested field', () => {
    expect(removeField({dog: 42, foo: {rat: 'bar'}}, 'foo.rat')).toEqual({dog: 42})
  })

  it('should remove a nested field from root', () => {
    expect(removeField({dog: 42, foo: {rat: 'bar'}}, 'foo')).toEqual({dog: 42})
  })

  it('should remove an array field', () => {
    expect(removeField({dog: 42, foo: [{rat: 'bar'}]}, 'foo[].rat')).toEqual({dog: 42})
  })

  it('should remove a deep field', () => {
    expect(removeField({dog: 42, foo: [{rat: {pig: 'bar'}}]}, 'foo[].rat.pig')).toEqual({dog: 42})
  })

  it('should remove an array field from root', () => {
    expect(removeField({dog: 42, foo: [{rat: 'bar'}]}, 'foo')).toEqual({dog: 42})
  })
})
