import createSecureStore from '@neverdull-agency/expo-unlimited-secure-store'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  combineReducers,
  configureStore,
  getDefaultMiddleware
} from '@reduxjs/toolkit'
import { InstancesV3 } from '@utils/migrations/instances/v3'
import contextsSlice from '@utils/slices/contextsSlice'
import instancesSlice from '@utils/slices/instancesSlice'
import settingsSlice from '@utils/slices/settingsSlice'
import { createMigrate, persistReducer, persistStore } from 'redux-persist'

const secureStorage = createSecureStore()

const prefix = 'tooot'

const contextsPersistConfig = {
  key: 'contexts',
  prefix,
  storage: AsyncStorage
}

const instancesMigration = {
  4: (state: InstancesV3) => {
    return {
      instances: state.local.instances.map((instance, index) => {
        // @ts-ignore
        delete instance.notification
        return {
          ...instance,
          active: state.local.activeIndex === index,
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
          }
        }
      })
    }
  }
}

const instancesPersistConfig = {
  key: 'instances',
  prefix,
  storage: secureStorage,
  version: 4,
  // @ts-ignore
  migrate: createMigrate(instancesMigration)
}

const settingsPersistConfig = {
  key: 'settings',
  prefix,
  storage: AsyncStorage
}

const rootPersistConfig = {
  key: 'root',
  prefix,
  version: 0,
  storage: AsyncStorage
}

const rootReducer = combineReducers({
  contexts: persistReducer(contextsPersistConfig, contextsSlice),
  instances: persistReducer(instancesPersistConfig, instancesSlice),
  settings: persistReducer(settingsPersistConfig, settingsSlice)
})

const store = configureStore({
  reducer: persistReducer(rootPersistConfig, rootReducer),
  middleware: getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: ['persist/PERSIST']
    }
  })
})

let persistor = persistStore(store)

export { store, persistor }
export type RootState = ReturnType<typeof store.getState>
