import { ParseEmojis } from '@components/Parse'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { TabLocalStackParamList } from '@utils/navigation/navigators'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useCallback } from 'react'
import { Pressable, View } from 'react-native'
import analytics from './analytics'
import GracefullyImage from './GracefullyImage'
import CustomText from './Text'

export interface Props {
  account: Mastodon.Account
  onPress?: () => void
  origin?: string
}

const ComponentAccount: React.FC<Props> = ({
  account,
  onPress: customOnPress,
  origin
}) => {
  const { colors } = useTheme()
  const navigation =
    useNavigation<StackNavigationProp<TabLocalStackParamList>>()

  const onPress = useCallback(() => {
    analytics('search_account_press', { page: origin })
    navigation.push('Tab-Shared-Account', { account })
  }, [])

  return (
    <Pressable
      accessibilityRole='button'
      style={{
        paddingHorizontal: StyleConstants.Spacing.Global.PagePadding,
        paddingVertical: StyleConstants.Spacing.M,
        flexDirection: 'row',
        alignItems: 'center'
      }}
      onPress={customOnPress || onPress}
    >
      <GracefullyImage
        uri={{ original: account.avatar, static: account.avatar_static }}
        style={{
          alignSelf: 'flex-start',
          width: StyleConstants.Avatar.S,
          height: StyleConstants.Avatar.S,
          borderRadius: 6,
          marginRight: StyleConstants.Spacing.S
        }}
      />
      <View>
        <CustomText numberOfLines={1}>
          <ParseEmojis
            content={account.display_name || account.username}
            emojis={account.emojis}
            size='S'
            fontBold
          />
        </CustomText>
        <CustomText
          numberOfLines={1}
          style={{
            marginTop: StyleConstants.Spacing.XS,
            color: colors.secondary
          }}
        >
          @{account.acct}
        </CustomText>
      </View>
    </Pressable>
  )
}

export default ComponentAccount
