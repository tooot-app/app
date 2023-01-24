import { ParseEmojis } from '@components/Parse'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { TabLocalStackParamList } from '@utils/navigation/navigators'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { PropsWithChildren } from 'react'
import { Pressable, PressableProps, View } from 'react-native'
import GracefullyImage from './GracefullyImage'
import Icon from './Icon'
import CustomText from './Text'

export interface Props {
  account: Partial<Mastodon.Account> & Pick<Mastodon.Account, 'id' | 'acct' | 'username' | 'url'>
  props?: PressableProps
}

const ComponentAccount: React.FC<PropsWithChildren & Props> = ({ account, props, children }) => {
  const { colors } = useTheme()
  const navigation = useNavigation<StackNavigationProp<TabLocalStackParamList>>()

  if (!props) {
    props = { onPress: () => navigation.push('Tab-Shared-Account', { account }) }
  }

  return (
    <Pressable
      {...props}
      style={{
        flex: 1,
        paddingHorizontal: StyleConstants.Spacing.Global.PagePadding,
        paddingVertical: StyleConstants.Spacing.M,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
      children={
        <>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <GracefullyImage
              uri={{ original: account.avatar, static: account.avatar_static }}
              style={{
                width: StyleConstants.Avatar.S,
                height: StyleConstants.Avatar.S,
                borderRadius: 8,
                marginRight: StyleConstants.Spacing.S
              }}
            />
            <View style={{ flex: 1 }}>
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
          </View>
          {props.onPress && !props.disabled ? (
            <Icon
              name='chevron-right'
              size={StyleConstants.Font.Size.L}
              color={colors.secondary}
              style={{ marginLeft: 8 }}
            />
          ) : (
            children || null
          )}
        </>
      }
    />
  )
}

export default ComponentAccount
