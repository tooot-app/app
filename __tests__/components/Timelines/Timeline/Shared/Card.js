import React from 'react'
import {
  toBeDisabled,
  toContainElement,
  toHaveStyle,
  toHaveTextContent
} from '@testing-library/jest-native'
import { cleanup, render } from '@testing-library/react-native/pure'

import Card from '@components/Timelines/Timeline/Shared/Card'

expect.extend({
  toBeDisabled,
  toContainElement,
  toHaveStyle,
  toHaveTextContent
})

describe('Testing component timeline card', () => {
  afterEach(cleanup)

  it('with text only', () => {
    const { getByTestId, queryByTestId, toJSON } = render(
      <Card
        card={{
          url: 'http://example.com',
          title: 'Title'
        }}
      />
    )

    expect(queryByTestId('image')).toBeNull()
    expect(getByTestId('base')).toContainElement(getByTestId('title'))
    expect(queryByTestId('description')).toBeNull()

    expect(getByTestId('title')).toHaveTextContent('Title')
    expect(toJSON()).toMatchSnapshot()
  })

  it('with text and description', () => {
    const { getByTestId, queryByTestId, toJSON } = render(
      <Card
        card={{
          url: 'http://example.com',
          title: 'Title',
          description: 'Description'
        }}
      />
    )

    expect(queryByTestId('image')).toBeNull()
    expect(getByTestId('base')).toContainElement(getByTestId('title'))
    expect(getByTestId('base')).toContainElement(getByTestId('description'))

    expect(getByTestId('title')).toHaveTextContent('Title')
    expect(getByTestId('description')).toHaveTextContent('Description')
    expect(toJSON()).toMatchSnapshot()
  })
})
