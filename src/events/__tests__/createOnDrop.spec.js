import expect, {createSpy} from 'expect'

import {dataKey} from '../createOnDragStart'
import createOnDrop from '../createOnDrop'

describe('createOnDrop', () => {
  it('should return a function', () => {
    expect(createOnDrop()).toExist().toBeA('function')
  })

  it('should return a function that calls change with result from getData', () => {
    const change = createSpy()
    const getData = createSpy().andReturn('bar')
    createOnDrop(
      'foo',
      change,
    )({
      dataTransfer: {getData},
    })
    expect(getData).toHaveBeenCalled().toHaveBeenCalledWith(dataKey)
    expect(change).toHaveBeenCalled().toHaveBeenCalledWith('foo', 'bar')
  })
})
