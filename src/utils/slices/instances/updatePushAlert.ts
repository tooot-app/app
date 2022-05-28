import apiInstance from '@api/instance'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { InstanceLatest } from '@utils/migrations/instances/migration'

export const updateInstancePushAlert = createAsyncThunk(
  'instances/updatePushAlert',
  async ({
    alerts
  }: {
    changed: keyof InstanceLatest['push']['alerts']
    alerts: InstanceLatest['push']['alerts']
  }): Promise<InstanceLatest['push']['alerts']> => {
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
