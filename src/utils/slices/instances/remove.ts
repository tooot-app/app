import { createAsyncThunk } from '@reduxjs/toolkit'
import * as AuthSession from 'expo-auth-session'
import { Instance } from '../instancesSlice'
import { updateInstancePush } from './updatePush'

const removeInstance = createAsyncThunk(
  'instances/remove',
  async (instance: Instance, { dispatch }): Promise<Instance> => {
    if (instance.push.global.value) {
      dispatch(updateInstancePush(false))
    }

    let revoked = undefined
    try {
      revoked = await AuthSession.revokeAsync(
        {
          clientId: instance.appData.clientId,
          clientSecret: instance.appData.clientSecret,
          token: instance.token,
          scopes: ['read', 'write', 'follow', 'push']
        },
        {
          revocationEndpoint: `https://${instance.url}/oauth/revoke`
        }
      )
    } catch {
      console.warn('Revoking error')
    }

    if (!revoked) {
      console.warn('Revoking error')
    }

    return Promise.resolve(instance)
  }
)

export default removeInstance
