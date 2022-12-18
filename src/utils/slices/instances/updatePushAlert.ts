import apiInstance from '@api/instance'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { InstanceLatest } from '@utils/migrations/instances/migration'

export const updateInstancePushAlert = createAsyncThunk(
  'instances/updatePushAlert',
  async ({
    alerts
  }: {
    alerts: InstanceLatest['push']['alerts']
  }): Promise<InstanceLatest['push']['alerts']> => {
    const formData = new FormData()
    for (const [key, value] of Object.entries(alerts)) {
      formData.append(`data[alerts][${key}]`, value.toString())
    }

    await apiInstance<Mastodon.PushSubscription>({
      method: 'put',
      url: 'push/subscription',
      body: formData
    })

    return Promise.resolve(alerts)
  }
)
