import { HeaderLeft } from '@components/Header'
import Icon from '@components/Icon'
import { ParseEmojis } from '@components/Parse'
import ComponentSeparator from '@components/Separator'
import CustomText from '@components/Text'
import TimelineAttachment from '@components/Timeline/Shared/Attachment'
import StatusContext from '@components/Timeline/Shared/Context'
import HeaderSharedCreated from '@components/Timeline/Shared/HeaderShared/Created'
import removeHTML from '@utils/helpers/removeHTML'
import { TabSharedStackScreenProps } from '@utils/navigation/navigators'
import { useStatusHistory } from '@utils/queryHooks/statusesHistory'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { diffChars, diffWords } from 'diff'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, View } from 'react-native'

const SCRIPTS_WITHOUT_BOUNDARIES = [
  'my',
  'zh',
  'ja',
  'kar',
  'km',
  'lp',
  'phag',
  'pwo',
  'kar',
  'lana',
  'th',
  'bo'
]

const ContentView: React.FC<{
  withoutBoundary: boolean
  item: Mastodon.StatusHistory
  prevItem?: Mastodon.StatusHistory
}> = ({ withoutBoundary, item, prevItem }) => {
  const { colors } = useTheme()

  const changesSpoiler = withoutBoundary
    ? diffChars(
        removeHTML(prevItem?.spoiler_text || item.spoiler_text || ''),
        removeHTML(item.spoiler_text || '')
      )
    : diffWords(
        removeHTML(prevItem?.spoiler_text || item.spoiler_text || ''),
        removeHTML(item.spoiler_text || '')
      )
  const changesContent = withoutBoundary
    ? diffChars(removeHTML(prevItem?.content || item.content), removeHTML(item.content))
    : diffWords(removeHTML(prevItem?.content || item.content), removeHTML(item.content))
  const changesPoll = item.poll
    ? item.poll.options.map((option, index) =>
        withoutBoundary
          ? prevItem?.poll?.options[index]?.title
            ? diffChars(prevItem?.poll?.options[index].title, option.title)
            : undefined
          : prevItem?.poll?.options[index]?.title
          ? diffWords(prevItem?.poll?.options[index].title, option.title)
          : undefined
      )
    : null

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
                name={item.poll?.multiple ? 'Square' : 'Circle'}
                size={StyleConstants.Font.Size.M}
                color={
                  prevItem?.poll?.multiple !== item.poll?.multiple ? colors.red : colors.disabled
                }
              />
              <CustomText style={{ flex: 1, color: colors.primaryDefault }}>
                {changesPoll?.[index]?.length ? (
                  changesPoll[index]?.map(({ value, added, removed }, index) => (
                    <ParseEmojis
                      key={index}
                      content={value}
                      emojis={item.poll?.emojis}
                      style={{
                        color: added ? colors.green : removed ? colors.red : undefined,
                        textDecorationLine: removed ? 'line-through' : undefined
                      }}
                    />
                  ))
                ) : (
                  <ParseEmojis content={option.title} emojis={item.poll?.emojis} />
                )}
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
    params: { status, detectedLanguage }
  }
}) => {
  const { t } = useTranslation('screenTabs')
  const { data } = useStatusHistory({ status })

  useEffect(() => {
    navigation.setOptions({
      title: t('shared.history.name'),
      headerLeft: () => <HeaderLeft onPress={() => navigation.goBack()} />
    })
  }, [])

  const dataReversed = data ? [...data].reverse() : []

  const withoutBoundary = !!SCRIPTS_WITHOUT_BOUNDARIES.filter(script =>
    detectedLanguage?.toLocaleLowerCase().startsWith(script)
  ).length

  return (
    <FlatList
      style={{ flex: 1, minHeight: '100%' }}
      data={dataReversed}
      renderItem={({ item, index }) => (
        <ContentView
          withoutBoundary={withoutBoundary}
          item={item}
          prevItem={dataReversed[index + 1]}
        />
      )}
      ItemSeparatorComponent={ComponentSeparator}
    />
  )
}

export default TabSharedHistory
