import { HeaderLeft } from '@components/Header'
import Icon from '@components/Icon'
import { ParseEmojis } from '@components/Parse'
import ComponentSeparator from '@components/Separator'
import CustomText from '@components/Text'
import TimelineAttachment from '@components/Timeline/Shared/Attachment'
import TimelineContent from '@components/Timeline/Shared/Content'
import StatusContext from '@components/Timeline/Shared/Context'
import HeaderSharedCreated from '@components/Timeline/Shared/HeaderShared/Created'
import { TabSharedStackScreenProps } from '@utils/navigation/navigators'
import { useStatusHistory } from '@utils/queryHooks/statusesHistory'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, View } from 'react-native'

const ContentView: React.FC<{ item: Mastodon.StatusHistory }> = ({ item }) => {
  const { colors } = useTheme()

  return (
    // @ts-ignore
    <StatusContext.Provider value={{ status: item, disableOnPress: true }}>
      <HeaderSharedCreated created_at={item.created_at} />
      <TimelineContent />
      {item.poll?.options.map((option, index) => (
        <View key={index} style={{ flex: 1, paddingVertical: StyleConstants.Spacing.XS }}>
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
              <ParseEmojis content={option.title} emojis={item.poll?.emojis} />
            </CustomText>
          </View>
        </View>
      ))}
      <TimelineAttachment />
    </StatusContext.Provider>
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
    <FlatList
      style={{ flex: 1, minHeight: '100%', padding: StyleConstants.Spacing.Global.PagePadding }}
      data={
        data && data.length > 0
          ? data
              .slice(0)
              .reverse()
              .filter((_, index) => index !== 0)
          : []
      }
      renderItem={({ item }) => <ContentView item={item} />}
      ItemSeparatorComponent={() => (
        <ComponentSeparator
          extraMarginLeft={0}
          style={{ marginVertical: StyleConstants.Spacing.Global.PagePadding }}
        />
      )}
    />
  )

  // return (
  //   <ScrollView>
  //     {data && data.length > 0
  //       ? data
  //           .slice(0)
  //           .reverse()
  //           .map((d, i) =>
  //             i !== 0 ? (
  //               <ContentView key={i} history={d} first={i === 1} last={i === data.length - 1} />
  //             ) : null
  //           )
  //       : null}
  //   </ScrollView>
  // )
}

export default TabSharedHistory
