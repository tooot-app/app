import apiInstance from '@api/instance'
import { createAsyncThunk } from '@reduxjs/toolkit'

export const updateAccountPreferences = createAsyncThunk(
  'instances/updateAccountPreferences',
  async (): Promise<Mastodon.Preferences> => {
    return apiInstance<Mastodon.Preferences>({
      method: 'get',
      url: `preferences`
    }).then(res => res.body)
  }
)
