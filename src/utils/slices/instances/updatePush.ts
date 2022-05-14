import { createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from '@root/store'
import { isDevelopment } from '@utils/checkEnvironment'
import * as Notifications from 'expo-notifications'
import { Instance } from '../instancesSlice'
import pushRegister from './push/register'
import pushUnregister from './push/unregister'

export const updateInstancePush = createAsyncThunk(
  'instances/updatePush',
  async (
    disable: boolean,
    { getState }
  ): Promise<Instance['push']['keys']['auth'] | undefined> => {
    const state = getState() as RootState
    const expoToken = isDevelopment
      ? 'DEVELOPMENT_TOKEN_1'
      : (
          await Notifications.getExpoPushTokenAsync({
            experienceId: '@xmflsct/tooot',
            applicationId: 'com.xmflsct.tooot.app'
          })
        ).data

    if (disable) {
      return await pushRegister(state, expoToken)
    } else {
      return await pushUnregister(state, expoToken)
    }
  }
)
