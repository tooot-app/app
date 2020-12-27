import React from 'react'
import { cleanup, render } from '@testing-library/react-native/pure'

import MenuHeader from '@components/Menu/Header'

describe('Testing component menu header', () => {
  afterEach(cleanup)

  it('with text only', () => {
    const { getByText, toJSON } = render(<MenuHeader heading='test' />)

    getByText('test')
    expect(toJSON()).toMatchSnapshot()
  })
})
