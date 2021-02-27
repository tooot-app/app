import apiGeneral from '@api/general'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from '@root/store'
import { Instance } from '../instancesSlice'

const addInstance = createAsyncThunk(
  'instances/add',
  async ({
    domain,
    token,
    instance,
    max_toot_chars = 500,
    appData
  }: {
    domain: Instance['url']
    token: Instance['token']
    instance: Mastodon.Instance
    max_toot_chars?: number
    appData: Instance['appData']
  }): Promise<{ type: 'add' | 'overwrite'; data: Instance }> => {
    const { store } = require('@root/store')
    const instances = (store.getState() as RootState).instances.instances

    const {
      body: { id, acct, avatar_static }
    } = await apiGeneral<Mastodon.Account>({
      method: 'get',
      domain,
      url: `api/v1/accounts/verify_credentials`,
      headers: { Authorization: `Bearer ${token}` }
    })

    let type: 'add' | 'overwrite'
    type = 'add'
    if (
      instances.length &&
      instances.filter(instance => {
        if (instance.url === domain && instance.account.id === id) {
          return true
        } else {
          return false
        }
      }).length
    ) {
      type = 'overwrite'
    } else {
      type = 'add'
    }

    const { body: preferences } = await apiGeneral<Mastodon.Preferences>({
      method: 'get',
      domain,
      url: `api/v1/preferences`,
      headers: { Authorization: `Bearer ${token}` }
    })

    return Promise.resolve({
      type,
      data: {
        active: true,
        appData,
        url: domain,
        token,
        uri: instance.uri,
        urls: instance.urls,
        max_toot_chars,
        account: {
          id,
          acct,
          avatarStatic: avatar_static,
          preferences
        },
        notification: {
          readTime: undefined,
          latestTime: undefined
        },
        push: {
          global: { loading: false, value: false },
          decode: { loading: false, value: false },
          alerts: {
            follow: { loading: false, value: true },
            favourite: { loading: false, value: true },
            reblog: { loading: false, value: true },
            mention: { loading: false, value: true },
            poll: { loading: false, value: true }
          },
          keys: undefined
        },
        drafts: []
      }
    })
  }
)

export default addInstance
