import Button from '@components/Button'
import { useNavigation } from '@react-navigation/native'
import { getLocalDrafts } from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import layoutAnimation from '@utils/styles/layoutAnimation'
import React, { useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { useSelector } from 'react-redux'
import ComposeContext from '../utils/createContext'

const ComposeDrafts: React.FC = () => {
  const { t } = useTranslation('sharedCompose')
  const navigation = useNavigation()
  const { composeState } = useContext(ComposeContext)
  const localDrafts = useSelector(getLocalDrafts)?.filter(
    draft => draft.timestamp !== composeState.timestamp
  )

  useEffect(() => {
    layoutAnimation()
  }, [composeState.dirty])

  if (!composeState.dirty && localDrafts?.length) {
    return (
      <View
        style={styles.base}
        children={
          <Button
            type='text'
            content={t('content.root.drafts', {
              count: localDrafts.length
            })}
            onPress={() =>
              navigation.navigate('Screen-Compose-DraftsList', {
                timestamp: composeState.timestamp
              })
            }
          />
        }
      />
    )
  } else {
    return null
  }
}

const styles = StyleSheet.create({
  base: {
    position: 'absolute',
    bottom: 45 + StyleConstants.Spacing.Global.PagePadding,
    right: StyleConstants.Spacing.Global.PagePadding
  }
})

export default ComposeDrafts
