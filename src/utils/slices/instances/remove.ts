import { createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from '@root/store'
import * as AuthSession from 'expo-auth-session'

const removeInstance = createAsyncThunk(
  'instances/remove',
  async (index: number): Promise<number> => {
    const { store } = require('@root/store')
    const instances = (store.getState() as RootState).instances.instances

    if (index !== -1) {
      const currentInstance = instances[index]

      let revoked = undefined
      try {
        revoked = await AuthSession.revokeAsync(
          {
            clientId: currentInstance.appData.clientId,
            clientSecret: currentInstance.appData.clientSecret,
            token: currentInstance.token,
            scopes: ['read', 'write', 'follow', 'push']
          },
          {
            revocationEndpoint: `https://${currentInstance.url}/oauth/revoke`
          }
        )
      } catch {
        console.warn('Revoking error')
      }

      if (!revoked) {
        console.warn('Revoking error')
      }
    }

    return Promise.resolve(index)
  }
)

export default removeInstance
