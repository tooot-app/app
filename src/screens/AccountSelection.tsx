import AccountButton from '@components/AccountButton'
import CustomText from '@components/Text'
import navigationRef from '@helpers/navigationRef'
import { RootStackScreenProps } from '@utils/navigation/navigators'
import { getInstances } from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import * as VideoThumbnails from 'expo-video-thumbnails'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Image, ScrollView, View } from 'react-native'
import { useSelector } from 'react-redux'

const Share = ({
  text,
  media
}: {
  text?: string | undefined
  media?:
    | {
        uri: string
        mime: string
      }[]
    | undefined
}) => {
  const { colors } = useTheme()

  const [images, setImages] = useState<string[]>([])
  useEffect(() => {
    const prepareThumbs = async (media: { uri: string; mime: string }[]) => {
      const thumbs: string[] = []
      for (const m of media) {
        if (m.mime.startsWith('image/')) {
          thumbs.push(m.uri)
        } else if (m.mime.startsWith('video/')) {
          const { uri } = await VideoThumbnails.getThumbnailAsync(m.uri)
          thumbs.push(uri)
        }
      }
      setImages(thumbs)
    }
    if (media) {
      prepareThumbs(media)
    }
  }, [])

  if (text) {
    return (
      <CustomText
        fontSize='S'
        style={{
          color: colors.primaryDefault,
          padding: StyleConstants.Spacing.M,
          borderWidth: 1,
          borderColor: colors.shimmerHighlight,
          borderRadius: 8
        }}
        children={text}
      />
    )
  }
  if (media) {
    return (
      <View
        style={{
          padding: StyleConstants.Spacing.M,
          borderWidth: 1,
          borderColor: colors.shimmerHighlight,
          borderRadius: 8
        }}
      >
        <FlatList
          horizontal
          data={images}
          renderItem={({ item }) => (
            <Image source={{ uri: item }} style={{ width: 88, height: 88 }} />
          )}
          ItemSeparatorComponent={() => <View style={{ width: StyleConstants.Spacing.S }} />}
        />
      </View>
    )
  }

  return null
}

// Only needed when data incoming into the app when there are multiple accounts
const ScreenAccountSelection = ({
  route: {
    params: { share }
  }
}: RootStackScreenProps<'Screen-AccountSelection'>) => {
  const { colors } = useTheme()
  const { t } = useTranslation('screenAccountSelection')

  const instances = useSelector(getInstances, () => true)

  return (
    <ScrollView
      style={{ marginBottom: StyleConstants.Spacing.L * 2 }}
      keyboardShouldPersistTaps='always'
    >
      <View
        style={{
          marginHorizontal: StyleConstants.Spacing.Global.PagePadding
        }}
      >
        {share ? <Share {...share} /> : null}
        <CustomText
          fontStyle='M'
          fontWeight='Bold'
          style={{
            textAlign: 'center',
            marginTop: StyleConstants.Spacing.L,
            marginBottom: StyleConstants.Spacing.S,
            color: colors.primaryDefault
          }}
        >
          {t('content.select_account')}
        </CustomText>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginTop: StyleConstants.Spacing.M
          }}
        >
          {instances.length
            ? instances
                .slice()
                .sort((a, b) =>
                  `${a.uri}${a.account.acct}`.localeCompare(`${b.uri}${b.account.acct}`)
                )
                .map((instance, index) => {
                  return (
                    <AccountButton
                      key={index}
                      instance={instance}
                      additionalActions={() => {
                        navigationRef.navigate('Screen-Compose', {
                          type: 'share',
                          ...share
                        })
                      }}
                    />
                  )
                })
            : null}
        </View>
      </View>
    </ScrollView>
  )
}

export default ScreenAccountSelection
