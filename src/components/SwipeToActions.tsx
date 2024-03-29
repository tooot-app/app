import { StyleConstants } from '@utils/styles/constants'
import { ColorValue, Pressable, View } from 'react-native'
import { SwipeListView } from 'react-native-swipe-list-view'
import haptics from './haptics'
import Icon, { IconName } from './Icon'
import ComponentSeparator from './Separator'

export type Props = {
  actions: {
    onPress: (item: any) => void
    color: ColorValue
    icon: IconName
    haptic?: Parameters<typeof haptics>['0']
  }[]
}

export const SwipeToActions = <T extends unknown>({
  actions,
  ...rest
}: Props & SwipeListView<T>['props']) => {
  const perActionWidth = StyleConstants.Spacing.L * 2 + StyleConstants.Font.Size.L

  return (
    <SwipeListView
      renderHiddenItem={({ item }) => (
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
          {actions.map((action, index) => (
            <Pressable
              key={index}
              onPress={() => {
                haptics(action.haptic || 'Light')
                action.onPress({ item })
              }}
              style={{ backgroundColor: 'rgba(0, 255, 0, 0.2)' }}
            >
              <View
                style={{
                  flex: 1,
                  paddingHorizontal: StyleConstants.Spacing.L,
                  flexBasis: perActionWidth,
                  backgroundColor: action.color,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Icon name={action.icon} color='white' size={StyleConstants.Font.Size.L} />
              </View>
            </Pressable>
          ))}
        </View>
      )}
      rightOpenValue={-perActionWidth * actions.length}
      disableRightSwipe
      closeOnRowPress
      ItemSeparatorComponent={ComponentSeparator}
      {...rest}
    />
  )
}
