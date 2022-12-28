import Constants from 'expo-constants'

const mapEnvironment = <T = unknown>({
  release,
  candidate,
  development
}: {
  release: T
  candidate?: T
  development?: T
}): T => {
  if (isDevelopment) {
    if (development) {
      return development
    } else {
      throw new Error('Development environment but no development handler')
    }
  }

  if (isCandidate) {
    if (candidate) {
      return candidate
    } else {
      throw new Error('Candidate environment but no candidate handler')
    }
  }

  if (isRelease) {
    return release
  }

  throw new Error(
    `Environment not set. Please set the environment in the Expo project settings.`
  )
}

const isDevelopment =
  __DEV__ ||
  ['development'].some(channel => (Constants.expoConfig?.extra?.environment) === channel)

const isCandidate = ['candidate'].some(channel =>
  (Constants.expoConfig?.extra?.environment) === channel
)

const isRelease = ['release'].some(channel =>
  (Constants.expoConfig?.extra?.environment) === channel
)

export { mapEnvironment, isDevelopment, isCandidate, isRelease }
