import apiInstance from '@api/instance'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { Instance } from '../instancesSlice'

export const updateInstancePushAlert = createAsyncThunk(
  'instances/updatePushAlert',
  async ({
    alerts
  }: {
    changed: keyof Instance['push']['alerts']
    alerts: Instance['push']['alerts']
  }): Promise<Instance['push']['alerts']> => {
    const formData = new FormData()
    Object.keys(alerts).map(alert =>
      // @ts-ignore
      formData.append(`data[alerts][${alert}]`, alerts[alert].value.toString())
    )

    await apiInstance<Mastodon.PushSubscription>({
      method: 'put',
      url: 'push/subscription',
      body: formData
    })

    return Promise.resolve(alerts)
  }
)
