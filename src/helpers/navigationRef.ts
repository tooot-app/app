import { createNavigationContainerRef } from '@react-navigation/native'
import { RootStackParamList } from '@utils/navigation/navigators'

const navigationRef = createNavigationContainerRef<RootStackParamList>()

export default navigationRef
