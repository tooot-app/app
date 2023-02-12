import Button from '@components/Button'
import { discardConfirmation } from '@components/discardConfirmation'
import Icon from '@components/Icon'
import CustomText from '@components/Text'
import { queryClient } from '@utils/queryHooks'
import { QueryKeyRelationship, useRelationshipMutation } from '@utils/queryHooks/relationship'
import { StyleConstants } from '@utils/styles/constants'
import layoutAnimation from '@utils/styles/layoutAnimation'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, TextInput, View } from 'react-native'
import AccountContext from '../Context'

const AccountInformationPrivateNote: React.FC = () => {
  const { relationship, pageMe } = useContext(AccountContext)
  if (!relationship || pageMe) return null

  const { colors, mode } = useTheme()
  const { t } = useTranslation(['common', 'screenTabs'])

  const [editing, setEditing] = useState(false)
  const [notes, setNotes] = useState(relationship?.note)

  const queryKey: QueryKeyRelationship = ['Relationship', { id: relationship.id }]
  const mutation = useRelationshipMutation({
    onMutate: async vars => {
      await queryClient.cancelQueries({ queryKey })
      queryClient.setQueryData<Mastodon.Relationship[]>(queryKey, old => {
        return old
          ? vars.type === 'note'
            ? old.map(o => (o.id === relationship.id ? { ...o, note: notes } : o))
            : old
          : undefined
      })
    },
    onError: () => {
      queryClient.invalidateQueries(queryKey)
    }
  })
  const submit = () => {
    mutation.mutate({ id: relationship.id, type: 'note', payload: notes || '' })
    setEditing(!editing)
    layoutAnimation()
  }

  return relationship?.following ? (
    editing ? (
      <View
        style={{
          marginBottom: StyleConstants.Spacing.L,
          padding: StyleConstants.Spacing.Global.PagePadding,
          borderWidth: 1,
          borderRadius: StyleConstants.BorderRadius,
          borderColor: colors.border
        }}
      >
        <TextInput
          style={{
            flex: 1,
            borderBottomWidth: 1,
            ...StyleConstants.FontStyle.M,
            color: colors.primaryDefault,
            borderBottomColor: colors.border,
            paddingVertical: StyleConstants.Spacing.S
          }}
          value={notes}
          onChangeText={setNotes}
          multiline
          textAlignVertical='top'
          clearButtonMode='never'
          onSubmitEditing={() => submit()}
          placeholder={t('screenTabs:shared.account.privateNote')}
          placeholderTextColor={colors.secondary}
          returnKeyType='done'
          keyboardAppearance={mode}
          autoFocus
        />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            marginTop: StyleConstants.Spacing.M,
            gap: StyleConstants.Spacing.S
          }}
        >
          <Button
            type='text'
            content={t('common:buttons.cancel')}
            onPress={() => {
              discardConfirmation({
                condition: notes != relationship?.note,
                action: () => {
                  setEditing(false)
                  layoutAnimation()
                }
              })
            }}
          />
          <Button type='text' content={t('common:buttons.confirm')} onPress={() => submit()} />
        </View>
      </View>
    ) : (
      <Pressable
        style={{
          marginBottom: StyleConstants.Spacing.L,
          borderLeftColor: colors.border,
          borderLeftWidth: StyleConstants.Spacing.XS,
          flexDirection: 'row',
          alignItems: 'center'
        }}
        onPress={() => {
          setEditing(!editing)
          layoutAnimation()
        }}
      >
        {!!relationship?.note.length ? (
          <CustomText
            fontSize='S'
            style={{
              color: colors.primaryDefault,
              paddingHorizontal: StyleConstants.Spacing.S,
              flexShrink: 1
            }}
            children={relationship.note}
            selectable
            numberOfLines={2}
          />
        ) : (
          <CustomText
            fontSize='S'
            style={{
              color: colors.secondary,
              paddingHorizontal: StyleConstants.Spacing.S,
              flexShrink: 1
            }}
            children={t('screenTabs:shared.account.privateNote')}
            selectable
            numberOfLines={2}
          />
        )}
        <Icon name='edit' size={StyleConstants.Font.Size.M} color={colors.secondary} />
      </Pressable>
    )
  ) : null
}

export default AccountInformationPrivateNote
