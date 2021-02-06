import createSecureStore from '@neverdull-agency/expo-unlimited-secure-store'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  combineReducers,
  configureStore,
  getDefaultMiddleware
} from '@reduxjs/toolkit'
import contextsSlice from '@utils/slices/contextsSlice'
import instancesSlice, { InstancesState } from '@utils/slices/instancesSlice'
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
  2: (state: InstancesState) => {
    return {
      ...state,
      local: {
        ...state.local,
        instances: state.local.instances.map(instance => {
          instance.max_toot_chars = 500
          instance.drafts = []
          return instance
        })
      }
    }
  }
}
const instancesPersistConfig = {
  key: 'instances',
  prefix,
  version: 2,
  storage: secureStorage,
  migrate: createMigrate(instancesMigration, { debug: true })
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
