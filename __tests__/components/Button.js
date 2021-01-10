import React from 'react'
import {
  toBeDisabled,
  toHaveStyle,
  toHaveTextContent
} from '@testing-library/jest-native'
import { cleanup, fireEvent, render } from '@testing-library/react-native/pure'

import Button from '@components/Button'

expect.extend({ toBeDisabled, toHaveStyle, toHaveTextContent })

describe('Testing component button', () => {
  afterEach(cleanup)

  describe('static button', () => {
    it('with text only', () => {
      const onPress = jest.fn()
      const { getByTestId, toJSON } = render(
        <Button type='text' content='Test Button' onPress={onPress} />
      )
      fireEvent.press(getByTestId('base'))

      expect(onPress).toHaveBeenCalled()
      expect(onPress).toHaveBeenCalledTimes(1)
      expect(getByTestId('text')).toHaveTextContent('Test Button')
      expect(toJSON()).toMatchSnapshot()
    })

    it('with icon only', () => {
      const onPress = jest.fn()
      const { getByTestId, toJSON } = render(
        <Button type='icon' content='X' onPress={onPress} />
      )
      fireEvent.press(getByTestId('base'))

      expect(onPress).toHaveBeenCalled()
      expect(onPress).toHaveBeenCalledTimes(1)
      expect(toJSON()).toMatchSnapshot()
    })

    it('loading state', () => {
      const { getByTestId, toJSON } = render(
        <Button type='text' content='test' onPress={jest.fn()} loading />
      )

      expect(getByTestId('base')).toBeDisabled()
      expect(toJSON()).toMatchSnapshot()
    })

    it('disabled state', () => {
      const { getByTestId, toJSON } = render(
        <Button type='text' content='test' onPress={jest.fn()} disabled />
      )

      expect(getByTestId('base')).toBeDisabled()
      expect(toJSON()).toMatchSnapshot()
    })

    it('apply custom styling', () => {
      const { getByTestId, toJSON } = render(
        <Button
          type='text'
          content='test'
          onPress={jest.fn()}
          style={{ backgroundColor: 'black' }}
        />
      )

      expect(getByTestId('base')).toHaveStyle({ backgroundColor: 'black' })
      expect(toJSON()).toMatchSnapshot()
    })
  })

  describe('dynamic button', () => {
    it('from default to loading', () => {
      const onPress = jest.fn()
      const { getByTestId, rerender } = render(
        <Button type='text' content='test' onPress={onPress} />
      )
      rerender(<Button type='text' content='test' onPress={onPress} loading />)

      expect(getByTestId('base')).toBeDisabled()
    })

    it('from default to disabled', () => {
      const onPress = jest.fn()
      const { getByTestId, rerender } = render(
        <Button type='text' content='test' onPress={onPress} />
      )
      rerender(<Button type='text' content='test' onPress={onPress} disabled />)

      expect(getByTestId('base')).toBeDisabled()
    })
  })
})
