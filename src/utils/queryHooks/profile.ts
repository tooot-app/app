import haptics from '@components/haptics'
import { displayMessage } from '@components/Message'
import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query'
import apiInstance from '@utils/api/instance'
import queryClient from '@utils/queryHooks'
import { AxiosError } from 'axios'
import i18next from 'i18next'
import { RefObject } from 'react'
import FlashMessage from 'react-native-flash-message'

type AccountWithSource = Mastodon.Account & Required<Pick<Mastodon.Account, 'source'>>

export type QueryKeyProfile = ['Profile']
const queryKey: QueryKeyProfile = ['Profile']

const queryFunctionProfile = async () => {
  const res = await apiInstance<AccountWithSource>({
    method: 'get',
    url: `accounts/verify_credentials`
  })
  return res.body
}

const useProfileQuery = (
  params: {
    options: UseQueryOptions<AccountWithSource, AxiosError>
  } | void
) => {
  return useQuery(queryKey, queryFunctionProfile, params?.options)
}

type MutationVarsProfileBase =
  | { type: 'display_name'; data: string }
  | { type: 'note'; data: string }
  | { type: 'avatar'; data: string }
  | { type: 'header'; data: string }
  | { type: 'locked'; data: boolean }
  | { type: 'bot'; data: boolean }
  | {
      type: 'source[privacy]'
      data: Mastodon.Preferences['posting:default:visibility']
    }
  | {
      type: 'source[sensitive]'
      data: Mastodon.Preferences['posting:default:sensitive']
    }
  | {
      type: 'fields_attributes'
      data: { name: string; value: string }[]
    }

type MutationVarsProfile = MutationVarsProfileBase & {
  messageRef: RefObject<FlashMessage>
  message: {
    text: string
    succeed: boolean
    failed: boolean
  }
}

const mutationFunction = async ({ type, data }: MutationVarsProfile) => {
  const formData = new FormData()
  if (type === 'fields_attributes') {
    if (!data.length) {
      formData.append('fields_attributes[]', '')
    } else {
      const tempData = data as { name: string; value: string }[]
      tempData.forEach((d, index) => {
        formData.append(`fields_attributes[${index}][name]`, d.name)
        formData.append(`fields_attributes[${index}][value]`, d.value)
      })
    }
  } else if (type === 'avatar' || type === 'header') {
    formData.append(type, {
      uri: data,
      name: 'image/jpeg',
      type: 'image/jpeg'
    } as any)
  } else {
    // @ts-ignore
    formData.append(type, data)
  }

  return apiInstance<AccountWithSource>({
    method: 'patch',
    url: 'accounts/update_credentials',
    body: formData
  })
}

const useProfileMutation = () => {
  return useMutation<{ body: AccountWithSource }, AxiosError, MutationVarsProfile>(
    mutationFunction,
    {
      onMutate: async variables => {
        await queryClient.cancelQueries(queryKey)

        const oldData = queryClient.getQueryData<AccountWithSource>(queryKey)

        queryClient.setQueryData<AccountWithSource | undefined>(queryKey, old => {
          if (old) {
            switch (variables.type) {
              case 'source[privacy]':
                return {
                  ...old,
                  source: { ...old.source, privacy: variables.data }
                }
              case 'source[sensitive]':
                return {
                  ...old,
                  source: { ...old.source, sensitive: variables.data }
                }
              case 'locked':
                return { ...old, locked: variables.data }
              case 'bot':
                return { ...old, bot: variables.data }
              default:
                return old
            }
          }
        })

        return oldData
      },
      onError: (err, variables, context) => {
        queryClient.setQueryData(queryKey, context)
        haptics('Error')
        if (variables.message.failed) {
          displayMessage({
            ref: variables.messageRef,
            message: i18next.t('screenTabs:me.profile.feedback.failed', {
              type: i18next.t(`screenTabs:${variables.message.text}` as any)
            }),
            ...(err && { description: err.message }),
            type: 'danger'
          })
        }
      },
      onSuccess: (_, variables) => {
        if (variables.message.succeed) {
          haptics('Success')
          displayMessage({
            ref: variables.messageRef,
            message: i18next.t('screenTabs:me.profile.feedback.succeed', {
              type: i18next.t(`screenTabs:${variables.message.text}` as any)
            }),
            type: 'success'
          })
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries(queryKey)
      }
    }
  )
}

export { queryFunctionProfile, useProfileQuery, useProfileMutation }
