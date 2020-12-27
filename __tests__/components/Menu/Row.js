import React from 'react'
import { toBeDisabled } from '@testing-library/jest-native'
import { cleanup, fireEvent, render } from '@testing-library/react-native'

import MenuRow from '@components/Menu/Row'

expect.extend({ toBeDisabled })

describe('Testing component menu row', () => {
  afterEach(cleanup)

  it('with title only', () => {
    const { getByText, toJSON } = render(<MenuRow title='test title' />)
    getByText('test title')
    expect(toJSON()).toMatchSnapshot()
  })

  it('with title and content', () => {
    const { getByText, toJSON } = render(
      <MenuRow title='test title' content='test content' />
    )
    getByText('test title')
    getByText('test content')
    expect(toJSON()).toMatchSnapshot()
  })

  it('on press event', () => {
    const onPress = jest.fn()
    const { getByTestId, toJSON } = render(
      <MenuRow title='test' onPress={onPress} />
    )
    fireEvent.press(getByTestId('base'))

    expect(onPress).toHaveBeenCalled()
    expect(onPress).toHaveBeenCalledTimes(1)
    expect(toJSON()).toMatchSnapshot()
  })

  it('loading state', () => {
    const onPress = jest.fn()
    const { getByTestId, toJSON } = render(
      <MenuRow title='test' loading onPress={onPress} />
    )
    fireEvent.press(getByTestId('base'))

    expect(onPress).toHaveBeenCalledTimes(0)
    expect(getByTestId('base')).toBeDisabled()
    expect(toJSON()).toMatchSnapshot()
  })
})
