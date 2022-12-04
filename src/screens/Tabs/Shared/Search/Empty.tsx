import ComponentHashtag from '@components/Hashtag'
import ComponentSeparator from '@components/Separator'
import CustomText from '@components/Text'
import { useTrendsQuery } from '@utils/queryHooks/trends'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { StyleSheet, TextInput, View } from 'react-native'
import { Circle } from 'react-native-animated-spinkit'

export interface Props {
  isLoading: boolean
  inputRef: React.RefObject<TextInput>
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>
}

const SearchEmpty: React.FC<Props> = ({ isLoading, inputRef, setSearchTerm }) => {
  const { colors } = useTheme()
  const { t } = useTranslation('screenTabs')

  const trendsTags = useTrendsQuery({ type: 'tags' })

  return (
    <View style={{ paddingVertical: StyleConstants.Spacing.Global.PagePadding }}>
      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Circle size={StyleConstants.Font.Size.M * 1.25} color={colors.secondary} />
        </View>
      ) : (
        <>
          <View style={{ paddingHorizontal: StyleConstants.Spacing.Global.PagePadding }}>
            <CustomText
              fontStyle='S'
              style={{
                marginBottom: StyleConstants.Spacing.L,
                color: colors.primaryDefault
              }}
            >
              <Trans
                i18nKey='screenTabs:shared.search.empty.general'
                components={{
                  bold: <CustomText fontWeight='Bold' />
                }}
              />
            </CustomText>
            <CustomText
              style={[styles.emptyAdvanced, { color: colors.primaryDefault }]}
              fontWeight='Bold'
            >
              {t('shared.search.empty.advanced.header')}
            </CustomText>
            <CustomText style={[styles.emptyAdvanced, { color: colors.primaryDefault }]}>
              <CustomText style={{ color: colors.secondary }}>@username@domain</CustomText>
              {'   '}
              {t('shared.search.empty.advanced.example.account')}
            </CustomText>
            <CustomText style={[styles.emptyAdvanced, { color: colors.primaryDefault }]}>
              <CustomText style={{ color: colors.secondary }}>#example</CustomText>
              {'   '}
              {t('shared.search.empty.advanced.example.hashtag')}
            </CustomText>
            <CustomText style={[styles.emptyAdvanced, { color: colors.primaryDefault }]}>
              <CustomText style={{ color: colors.secondary }}>URL</CustomText>
              {'   '}
              {t('shared.search.empty.advanced.example.statusLink')}
            </CustomText>
            <CustomText style={[styles.emptyAdvanced, { color: colors.primaryDefault }]}>
              <CustomText style={{ color: colors.secondary }}>URL</CustomText>
              {'   '}
              {t('shared.search.empty.advanced.example.accountLink')}
            </CustomText>
          </View>

          <CustomText
            style={{
              color: colors.primaryDefault,
              marginTop: StyleConstants.Spacing.M,
              paddingHorizontal: StyleConstants.Spacing.Global.PagePadding
            }}
            fontWeight='Bold'
          >
            {t('shared.search.empty.trending.tags')}
          </CustomText>
          <View>
            {trendsTags.data?.map((tag, index) => {
              const hashtag = tag as Mastodon.Tag
              return (
                <React.Fragment key={index}>
                  {index !== 0 ? <ComponentSeparator /> : null}
                  <ComponentHashtag
                    hashtag={hashtag}
                    onPress={() => {
                      inputRef.current?.setNativeProps({ text: `#${hashtag.name}` })
                      setSearchTerm(`#${hashtag.name}`)
                    }}
                  />
                </React.Fragment>
              )
            })}
          </View>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  emptyAdvanced: {
    marginBottom: StyleConstants.Spacing.S
  }
})

export default SearchEmpty
