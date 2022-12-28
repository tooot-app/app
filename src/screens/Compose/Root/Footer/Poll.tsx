import Button from '@components/Button'
import Icon from '@components/Icon'
import { MenuRow } from '@components/Menu'
import CustomText from '@components/Text'
import { useActionSheet } from '@expo/react-native-action-sheet'
import { androidActionSheetStyles } from '@utils/helpers/androidActionSheetStyles'
import { useInstanceQuery } from '@utils/queryHooks/instance'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, TextInput, View } from 'react-native'
import ComposeContext from '../../utils/createContext'

const ComposePoll: React.FC = () => {
  const { showActionSheetWithOptions } = useActionSheet()
  const {
    composeState: {
      poll: { total, options, multiple, expire }
    },
    composeDispatch
  } = useContext(ComposeContext)
  const { t } = useTranslation(['common', 'screenCompose'])
  const { colors, mode } = useTheme()

  const { data } = useInstanceQuery()
  const MAX_OPTIONS = data?.configuration?.polls.max_options || 4
  const MAX_CHARS_PER_OPTION = data?.configuration?.polls.max_characters_per_option
  const MIN_EXPIRATION = data?.configuration?.polls.min_expiration || 300
  const MAX_EXPIRATION = data?.configuration?.polls.max_expiration || 2629746

  const [firstRender, setFirstRender] = useState(true)
  useEffect(() => {
    setFirstRender(false)
  }, [])

  return (
    <View
      style={{
        flex: 1,
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 6,
        margin: StyleConstants.Spacing.Global.PagePadding,
        borderColor: colors.border
      }}
    >
      <View
        style={{
          marginTop: StyleConstants.Spacing.M,
          marginBottom: StyleConstants.Spacing.S
        }}
      >
        {[...Array(total)].map((e, i) => {
          const restOptions = Object.keys(options).filter(
            o => parseInt(o) !== i && parseInt(o) < total
          )
          let hasConflict = false
          restOptions.forEach(o => {
            // @ts-ignore
            if (options[o] === options[i]) {
              hasConflict = true
            }
          })
          return (
            <View key={i} style={styles.option}>
              <Icon
                name={multiple ? 'Square' : 'Circle'}
                size={StyleConstants.Font.Size.L}
                color={colors.secondary}
              />
              <TextInput
                accessibilityLabel={t(
                  'screenCompose:content.root.footer.poll.option.placeholder.accessibilityLabel',
                  { index: i + 1 }
                )}
                keyboardAppearance={mode}
                {...(i === 0 && firstRender && { autoFocus: true })}
                style={{
                  flex: 1,
                  padding: StyleConstants.Spacing.S,
                  borderWidth: StyleSheet.hairlineWidth,
                  borderRadius: 6,
                  ...StyleConstants.FontStyle.M,
                  marginLeft: StyleConstants.Spacing.S,
                  borderColor: colors.border,
                  color: hasConflict ? colors.red : colors.primaryDefault
                }}
                placeholder={
                  multiple
                    ? t('screenCompose:content.root.footer.poll.option.placeholder.multiple')
                    : t('screenCompose:content.root.footer.poll.option.placeholder.single')
                }
                placeholderTextColor={colors.disabled}
                maxLength={MAX_CHARS_PER_OPTION}
                // @ts-ignore
                value={options[i]}
                onChangeText={e =>
                  composeDispatch({
                    type: 'poll',
                    payload: { options: { ...options, [i]: e } }
                  })
                }
              />
            </View>
          )
        })}
      </View>
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
          marginRight: StyleConstants.Spacing.M
        }}
      >
        <Button
          {...(total > 2
            ? {
                accessibilityLabel: t(
                  'screenCompose:content.root.footer.poll.quantity.reduce.accessibilityLabel',
                  { amount: total - 1 }
                )
              }
            : {
                accessibilityHint: t(
                  'screenCompose:content.root.footer.poll.quantity.reduce.accessibilityHint',
                  { amount: total }
                )
              })}
          onPress={() => {
            total > 2 &&
              composeDispatch({
                type: 'poll',
                payload: { total: total - 1 }
              })
          }}
          type='icon'
          content='Minus'
          round
          disabled={!(total > 2)}
        />
        <CustomText
          style={{
            marginHorizontal: StyleConstants.Spacing.S,
            color: colors.secondary
          }}
        >
          {total} / {MAX_OPTIONS}
        </CustomText>
        <Button
          {...(total < MAX_OPTIONS
            ? {
                accessibilityLabel: t(
                  'screenCompose:content.root.footer.poll.quantity.increase.accessibilityLabel',
                  { amount: total + 1 }
                )
              }
            : {
                accessibilityHint: t(
                  'screenCompose:content.root.footer.poll.quantity.increase.accessibilityHint',
                  { amount: total }
                )
              })}
          onPress={() => {
            total < MAX_OPTIONS &&
              composeDispatch({
                type: 'poll',
                payload: { total: total + 1 }
              })
          }}
          type='icon'
          content='Plus'
          round
          disabled={!(total < MAX_OPTIONS)}
        />
      </View>
      <View style={{ paddingHorizontal: StyleConstants.Spacing.Global.PagePadding }}>
        <MenuRow
          title={t('screenCompose:content.root.footer.poll.multiple.heading')}
          content={
            multiple
              ? t('screenCompose:content.root.footer.poll.multiple.options.multiple')
              : t('screenCompose:content.root.footer.poll.multiple.options.single')
          }
          onPress={() =>
            showActionSheetWithOptions(
              {
                options: [
                  t('screenCompose:content.root.footer.poll.multiple.options.single'),
                  t('screenCompose:content.root.footer.poll.multiple.options.multiple'),
                  t('common:buttons.cancel')
                ],
                cancelButtonIndex: 2,
                ...androidActionSheetStyles(colors)
              },
              index => {
                if (index && index < 2) {
                  composeDispatch({
                    type: 'poll',
                    payload: { multiple: index === 1 }
                  })
                }
              }
            )
          }
          iconBack='ChevronRight'
        />
        <MenuRow
          title={t('screenCompose:content.root.footer.poll.expiration.heading')}
          content={t(`screenCompose:content.root.footer.poll.expiration.options.${expire}`)}
          onPress={() => {
            const expirations = [
              '300',
              '1800',
              '3600',
              '21600',
              '86400',
              '259200',
              '604800'
            ].filter(
              expiration =>
                parseInt(expiration) >= MIN_EXPIRATION && parseInt(expiration) <= MAX_EXPIRATION
            )
            showActionSheetWithOptions(
              {
                options: [
                  ...expirations.map(e =>
                    t(`screenCompose:content.root.footer.poll.expiration.options.${e}` as any)
                  ),
                  t('common:buttons.cancel')
                ],
                cancelButtonIndex: expirations.length,
                ...androidActionSheetStyles(colors)
              },
              index => {
                if (index !== undefined && index < expirations.length) {
                  composeDispatch({
                    type: 'poll',
                    // @ts-ignore
                    payload: { expire: expirations[index] }
                  })
                }
              }
            )
          }}
          iconBack='ChevronRight'
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  option: {
    marginLeft: StyleConstants.Spacing.M,
    marginRight: StyleConstants.Spacing.M,
    marginBottom: StyleConstants.Spacing.S,
    flexDirection: 'row',
    alignItems: 'center'
  }
})

export default ComposePoll
