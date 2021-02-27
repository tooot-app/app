import apiGeneral from '@api/general'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from '@root/store'
import * as Notifications from 'expo-notifications'
import { getInstance, Instance, PUSH_SERVER } from '../instancesSlice'

export const updateInstancePushDecode = createAsyncThunk(
  'instances/updatePushDecode',
  async (
    disalbe: boolean,
    { getState }
  ): Promise<Instance['push']['decode']['value']> => {
    const state = getState() as RootState
    const instance = getInstance(state)
    if (!instance?.url || !instance.account.id || !instance.push.keys) {
      return Promise.reject()
    }

    const expoToken = (
      await Notifications.getExpoPushTokenAsync({
        experienceId: '@xmflsct/tooot'
      })
    ).data

    await apiGeneral({
      method: 'post',
      domain: PUSH_SERVER,
      url: 'v1/update-decode',
      body: {
        expoToken,
        instanceUrl: instance.url,
        accountId: instance.account.id,
        ...(disalbe && { keys: instance.push.keys })
      }
    })

    return Promise.resolve(disalbe)
  }
)
