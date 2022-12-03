import { HeaderLeft } from '@components/Header'
import Icon from '@components/Icon'
import { ParseEmojis } from '@components/Parse'
import ComponentSeparator from '@components/Separator'
import CustomText from '@components/Text'
import TimelineAttachment from '@components/Timeline/Shared/Attachment'
import TimelineContent from '@components/Timeline/Shared/Content'
import HeaderSharedCreated from '@components/Timeline/Shared/HeaderShared/Created'
import { TabSharedStackScreenProps } from '@utils/navigation/navigators'
import { useStatusHistory } from '@utils/queryHooks/statusesHistory'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

const ContentView = ({
  history,
  first,
  last
}: {
  history: Mastodon.StatusHistory
  first: boolean
  last: boolean
}) => {
  const { colors } = useTheme()

  return (
    <>
      <View
        style={{
          padding: StyleConstants.Spacing.Global.PagePadding,
          paddingTop: first ? 0 : undefined
        }}
      >
        <HeaderSharedCreated created_at={history.created_at} />
        {typeof history.content === 'string' && history.content.length > 0 ? (
          <TimelineContent status={history} />
        ) : null}
        {history.poll
          ? history.poll.options.map((option, index) => (
              <View key={index} style={{ flex: 1, paddingVertical: StyleConstants.Spacing.S }}>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                  <Icon
                    style={{
                      paddingTop: StyleConstants.Font.LineHeight.M - StyleConstants.Font.Size.M,
                      marginRight: StyleConstants.Spacing.S
                    }}
                    name='Circle'
                    size={StyleConstants.Font.Size.M}
                    color={colors.disabled}
                  />
                  <CustomText style={{ flex: 1 }}>
                    <ParseEmojis content={option.title} emojis={history.poll?.emojis} />
                  </CustomText>
                </View>
              </View>
            ))
          : null}
        {Array.isArray(history.media_attachments) && history.media_attachments.length ? (
          <TimelineAttachment status={history} />
        ) : null}
      </View>
      {!last ? <ComponentSeparator extraMarginLeft={0} /> : null}
    </>
  )
}

const TabSharedHistory: React.FC<TabSharedStackScreenProps<'Tab-Shared-History'>> = ({
  navigation,
  route: {
    params: { id }
  }
}) => {
  const { t } = useTranslation('screenTabs')
  const { data } = useStatusHistory({ id })

  useEffect(() => {
    navigation.setOptions({
      title: t('shared.history.name'),
      headerLeft: () => <HeaderLeft onPress={() => navigation.goBack()} />
    })
  }, [])

  return (
    <ScrollView>
      {data && data.length > 0
        ? data
            .slice(0)
            .reverse()
            .map((d, i) =>
              i !== 0 ? (
                <ContentView key={i} history={d} first={i === 1} last={i === data.length - 1} />
              ) : null
            )
        : null}
    </ScrollView>
  )
}

export default TabSharedHistory
