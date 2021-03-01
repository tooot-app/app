import apiGeneral from '@api/general'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from '@root/store'
import * as Notifications from 'expo-notifications'
import { TFunction } from 'react-i18next'
import { PUSH_SERVER } from '../instancesSlice'

export const connectInstancesPush = createAsyncThunk(
  'instances/connectPush',
  async (
    { mode, t }: { mode: 'light' | 'dark'; t: TFunction<'common'> },
    { getState }
  ): Promise<any> => {
    const state = getState() as RootState
    const pushEnabled = state.instances.instances.filter(
      instance => instance.push.global.value
    )

    if (pushEnabled.length) {
      const expoToken = (
        await Notifications.getExpoPushTokenAsync({
          experienceId: '@xmflsct/tooot'
        })
      ).data

      return apiGeneral({
        method: 'post',
        domain: PUSH_SERVER,
        url: 'v1/connect',
        body: {
          expoToken
        }
      })
    } else {
      return Promise.resolve()
    }
  }
)
