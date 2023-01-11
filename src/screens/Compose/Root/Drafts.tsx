import Button from '@components/Button'
import { useNavigation } from '@react-navigation/native'
import { useAccountStorage } from '@utils/storage/actions'
import { StyleConstants } from '@utils/styles/constants'
import layoutAnimation from '@utils/styles/layoutAnimation'
import React, { RefObject, useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import ComposeContext from '../utils/createContext'

export interface Props {
  accessibleRefDrafts: RefObject<View>
}

const ComposeDrafts: React.FC<Props> = ({ accessibleRefDrafts }) => {
  const { t } = useTranslation('screenCompose')
  const navigation = useNavigation<any>()
  const { composeState } = useContext(ComposeContext)
  const [drafts] = useAccountStorage.object('drafts')
  const draftsCount = drafts?.filter(draft => draft.timestamp !== composeState.timestamp).length

  useEffect(() => {
    layoutAnimation()
  }, [composeState.dirty])

  if (!composeState.dirty && draftsCount) {
    return (
      <View
        accessible
        ref={accessibleRefDrafts}
        style={styles.base}
        children={
          <Button
            type='text'
            content={t('content.root.drafts', { count: draftsCount })}
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
