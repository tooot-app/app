import apiInstance from '@api/instance'
import { createAsyncThunk } from '@reduxjs/toolkit'

export const updateConfiguration = createAsyncThunk(
  'instances/updateConfiguration',
  async (): Promise<Mastodon.Instance> => {
    return apiInstance<Mastodon.Instance>({
      method: 'get',
      url: `instance`
    }).then(res => res.body)
  }
)
