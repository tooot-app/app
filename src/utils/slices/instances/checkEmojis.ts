import apiInstance from '@api/instance'
import queryClient from '@helpers/queryClient'
import { createAsyncThunk } from '@reduxjs/toolkit'

export const checkEmojis = createAsyncThunk(
  'instances/checkEmojis',
  async (): Promise<Mastodon.Emoji[]> => {
    const res = await apiInstance<Mastodon.Emoji[]>({
      method: 'get',
      url: 'custom_emojis'
    }).then(res => res.body)
    queryClient.setQueryData(['Emojis'], res)
    return res
  }
)
