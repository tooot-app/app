import CustomText from '@components/Text'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { View, ViewStyle } from 'react-native'
import { PlaceholderLine } from 'rn-placeholder'

export interface Props {
  style?: ViewStyle
  header: string
  content?: string
  potentialWidth?: number
}

const InstanceInfo = React.memo(
  ({ style, header, content, potentialWidth }: Props) => {
    const { colors } = useTheme()

    return (
      <View
        style={[
          {
            flex: 1,
            marginTop: StyleConstants.Spacing.M,
            paddingLeft: StyleConstants.Spacing.Global.PagePadding,
            paddingRight: StyleConstants.Spacing.Global.PagePadding
          },
          style
        ]}
        accessible
      >
        <CustomText
          fontStyle='S'
          style={{
            marginBottom: StyleConstants.Spacing.XS,
            color: colors.primaryDefault
          }}
          fontWeight='Bold'
          children={header}
        />
        {content ? (
          <CustomText
            fontStyle='M'
            style={{ color: colors.primaryDefault }}
            children={content}
          />
        ) : (
          <PlaceholderLine
            width={
              potentialWidth
                ? potentialWidth * StyleConstants.Font.Size.M
                : undefined
            }
            height={StyleConstants.Font.LineHeight.M}
            color={colors.shimmerDefault}
            noMargin
            style={{ borderRadius: 0 }}
          />
        )}
      </View>
    )
  },
  (prev, next) => prev.content === next.content
)

export default InstanceInfo
