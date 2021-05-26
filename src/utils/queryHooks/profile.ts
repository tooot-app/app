import apiInstance from '@api/instance'
import queryClient from '@helpers/queryClient'
import { AxiosError } from 'axios'
import { useMutation, useQuery, UseQueryOptions } from 'react-query'

type AccountWithSource = Mastodon.Account &
  Required<Pick<Mastodon.Account, 'source'>>

type QueryKeyProfile = ['Profile']
const queryKey: QueryKeyProfile = ['Profile']

const queryFunction = () => {
  return apiInstance<AccountWithSource>({
    method: 'get',
    url: `accounts/verify_credentials`
  }).then(res => res.body)
}

const useProfileQuery = <TData = AccountWithSource>({
  options
}: {
  options?: UseQueryOptions<AccountWithSource, AxiosError, TData>
}) => {
  return useQuery(queryKey, queryFunction, options)
}

type MutationVarsProfile =
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

const mutationFunction = async ({ type, data }: MutationVarsProfile) => {
  const formData = new FormData()
  if (type === 'fields_attributes') {
    const tempData = data as { name: string; value: string }[]
    tempData.forEach((d, index) => {
      formData.append(`fields_attributes[${index}][name]`, d.name)
      formData.append(`fields_attributes[${index}][value]`, d.value)
    })
  } else if (type === 'avatar' || type === 'header') {
    formData.append(type, {
      // @ts-ignore
      uri: data,
      name: 'image/jpeg',
      type: 'image/jpeg'
    })
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
  return useMutation<
    { body: AccountWithSource },
    AxiosError,
    MutationVarsProfile
  >(mutationFunction, {
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
    onError: (_, variables, context) => {
      queryClient.setQueryData(queryKey, context)
    },
    onSettled: () => {
      queryClient.invalidateQueries(queryKey)
    }
  })
}

export { useProfileQuery, useProfileMutation }
