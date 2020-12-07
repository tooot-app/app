import React, { Dispatch, useEffect, useState } from 'react'
import { ActionSheetIOS, StyleSheet, TextInput, View } from 'react-native'
import { Feather } from '@expo/vector-icons'

import { PostAction, ComposeState } from '../Compose'
import { useTheme } from 'src/utils/styles/ThemeManager'
import { StyleConstants } from 'src/utils/styles/constants'
import { ButtonRow } from 'src/components/Button'
import { MenuContainer, MenuRow } from 'src/components/Menu'

export interface Props {
  composeState: ComposeState
  composeDispatch: Dispatch<PostAction>
}

const ComposePoll: React.FC<Props> = ({ composeState, composeDispatch }) => {
  const { theme } = useTheme()

  const expireMapping: { [key: string]: string } = {
    '300': '5分钟',
    '1800': '30分钟',
    '3600': '1小时',
    '21600': '6小时',
    '86400': '1天',
    '259200': '3天',
    '604800': '7天'
  }

  const [firstRender, setFirstRender] = useState(true)
  useEffect(() => {
    setFirstRender(false)
  }, [])

  return (
    <View style={[styles.base, { borderColor: theme.border }]}>
      <View style={styles.options}>
        {[...Array(composeState.poll.total)].map((e, i) => {
          const restOptions = Object.keys(composeState.poll.options).filter(
            o => parseInt(o) !== i && parseInt(o) < composeState.poll.total
          )
          let hasConflict = false
          restOptions.forEach(o => {
            // @ts-ignore
            if (composeState.poll.options[o] === composeState.poll.options[i]) {
              hasConflict = true
            }
          })
          return (
            <View key={i} style={styles.option}>
              <Feather
                name={composeState.poll.multiple ? 'square' : 'circle'}
                size={StyleConstants.Font.Size.L}
                color={theme.secondary}
              />
              <TextInput
                {...(i === 0 && firstRender && { autoFocus: true })}
                style={[
                  styles.textInput,
                  {
                    borderColor: theme.border,
                    color: hasConflict ? theme.error : theme.primary
                  }
                ]}
                placeholder={`选项`}
                placeholderTextColor={theme.secondary}
                maxLength={50}
                // @ts-ignore
                value={composeState.poll.options[i]}
                onChangeText={e =>
                  composeDispatch({
                    type: 'poll',
                    payload: {
                      ...composeState.poll,
                      options: { ...composeState.poll.options, [i]: e }
                    }
                  })
                }
              />
            </View>
          )
        })}
      </View>
      <View style={styles.controlAmount}>
        <View style={styles.firstButton}>
          <ButtonRow
            onPress={() =>
              composeState.poll.total > 2 &&
              composeDispatch({
                type: 'poll',
                payload: { ...composeState.poll, total: composeState.poll.total - 1 }
              })
            }
            icon='minus'
            disabled={!(composeState.poll.total > 2)}
            buttonSize='S'
          />
        </View>
        <ButtonRow
          onPress={() =>
            composeState.poll.total < 4 &&
            composeDispatch({
              type: 'poll',
              payload: { ...composeState.poll, total: composeState.poll.total + 1 }
            })
          }
          icon='plus'
          disabled={!(composeState.poll.total < 4)}
          buttonSize='S'
        />
      </View>
      <MenuContainer>
        <MenuRow
          title='可选项'
          content={composeState.poll.multiple ? '多选' : '单选'}
          onPress={() =>
            ActionSheetIOS.showActionSheetWithOptions(
              {
                options: ['单选', '多选', '取消'],
                cancelButtonIndex: 2
              },
              index =>
                index < 2 &&
                composeDispatch({
                  type: 'poll',
                  payload: { ...composeState.poll, multiple: index === 1 }
                })
            )
          }
          iconBack='chevron-right'
        />
        <MenuRow
          title='有效期'
          content={expireMapping[composeState.poll.expire]}
          onPress={() =>
            ActionSheetIOS.showActionSheetWithOptions(
              {
                options: [...Object.values(expireMapping), '取消'],
                cancelButtonIndex: 7
              },
              index =>
                index < 7 &&
                composeDispatch({
                  type: 'poll',
                  payload: {
                    ...composeState.poll,
                    expire: Object.keys(expireMapping)[index]
                  }
                })
            )
          }
          iconBack='chevron-right'
        />
      </MenuContainer>
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 6
  },
  options: {
    marginTop: StyleConstants.Spacing.M,
    marginBottom: StyleConstants.Spacing.S
  },
  option: {
    marginLeft: StyleConstants.Spacing.M,
    marginRight: StyleConstants.Spacing.M,
    marginBottom: StyleConstants.Spacing.S,
    flexDirection: 'row',
    alignItems: 'center'
  },
  textInput: {
    flex: 1,
    padding: StyleConstants.Spacing.S,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 6,
    fontSize: StyleConstants.Font.Size.M,
    marginLeft: StyleConstants.Spacing.S
  },
  controlAmount: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginRight: StyleConstants.Spacing.M,
    marginBottom: StyleConstants.Spacing.M
  },
  firstButton: {
    marginRight: StyleConstants.Spacing.S
  }
})

export default ComposePoll
