import apiGeneral from '@api/general'
import apiInstance from '@api/instance'
import { RootState } from '@root/store'
import { getInstance, PUSH_SERVER } from '@utils/slices/instancesSlice'

const pushUnregister = async (state: RootState, expoToken: string) => {
  const instance = getInstance(state)

  if (!instance?.url || !instance.account.id) {
    return Promise.reject()
  }

  await apiInstance<{}>({
    method: 'delete',
    url: 'push/subscription'
  })

  await apiGeneral<{ endpoint: string; publicKey: string; auth: string }>({
    method: 'post',
    domain: PUSH_SERVER,
    url: 'v1/unregister',
    body: {
      expoToken,
      instanceUrl: instance.url,
      accountId: instance.account.id
    }
  })

  return
}

export default pushUnregister
