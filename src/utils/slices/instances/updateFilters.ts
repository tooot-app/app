import apiInstance from '@api/instance'
import { createAsyncThunk } from '@reduxjs/toolkit'

export const updateFilters = createAsyncThunk(
  'instances/updateFilters',
  async (): Promise<Mastodon.Filter<any>[]> => {
    return apiInstance<Mastodon.Filter<any>[]>({
      method: 'get',
      url: `filters`
    }).then(res => res.body)
  }
)
