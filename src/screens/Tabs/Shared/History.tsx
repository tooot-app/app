import { HeaderLeft } from '@components/Header'
import Icon from '@components/Icon'
import { ParseEmojis } from '@components/Parse'
import ComponentSeparator from '@components/Separator'
import CustomText from '@components/Text'
import TimelineAttachment from '@components/Timeline/Shared/Attachment'
import StatusContext from '@components/Timeline/Shared/Context'
import HeaderSharedCreated from '@components/Timeline/Shared/HeaderShared/Created'
import removeHTML from '@helpers/removeHTML'
import { TabSharedStackScreenProps } from '@utils/navigation/navigators'
import { useStatusHistory } from '@utils/queryHooks/statusesHistory'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { diffWords } from 'diff'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, View } from 'react-native'

const ContentView: React.FC<{
  item: Mastodon.StatusHistory
  prevItem?: Mastodon.StatusHistory
}> = ({ item, prevItem }) => {
  const { colors } = useTheme()

  const changesSpoiler = diffWords(
    removeHTML(prevItem?.spoiler_text || item.spoiler_text || ''),
    removeHTML(item.spoiler_text || '')
  )
  const changesContent = diffWords(
    removeHTML(prevItem?.content || item.content),
    removeHTML(item.content)
  )

  return (
    // @ts-ignore
    <StatusContext.Provider value={{ status: item, disableOnPress: true }}>
      <View style={{ padding: StyleConstants.Spacing.Global.PagePadding }}>
        <HeaderSharedCreated created_at={item.created_at} />
        {changesSpoiler.length && changesSpoiler[0].count ? (
          <CustomText fontSize='M' style={{ color: colors.primaryDefault }}>
            {changesSpoiler.map(({ value, added, removed }, index) => (
              <ParseEmojis
                key={index}
                content={value}
                emojis={item.emojis}
                style={{
                  color: added ? colors.green : removed ? colors.red : undefined,
                  textDecorationLine: removed ? 'line-through' : undefined
                }}
              />
            ))}
          </CustomText>
        ) : null}
        <CustomText fontSize='M' style={{ color: colors.primaryDefault }}>
          {changesContent.map(({ value, added, removed }, index) => (
            <ParseEmojis
              key={index}
              content={value}
              emojis={item.emojis}
              style={{
                color: added ? colors.green : removed ? colors.red : undefined,
                textDecorationLine: removed ? 'line-through' : undefined
              }}
            />
          ))}
        </CustomText>
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
      </View>
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

  const dataReversed = data ? [...data].reverse() : []

  return (
    <FlatList
      style={{ flex: 1, minHeight: '100%' }}
      data={dataReversed}
      renderItem={({ item, index }) => (
        <ContentView item={item} prevItem={dataReversed[index + 1]} />
      )}
      ItemSeparatorComponent={ComponentSeparator}
    />
  )
}

export default TabSharedHistory
