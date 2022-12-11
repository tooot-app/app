import apiTooot from '@api/tooot'
import haptics from '@components/haptics'
import { AxiosError } from 'axios'
import { QueryFunctionContext, useQuery, UseQueryOptions } from '@tanstack/react-query'

type Translations =
  | {
      error: undefined
      provider: string
      sourceLanguage: string
      text: string[]
    }
  | {
      error: string
      provider: undefined
      sourceLanguage: undefined
      text: undefined
    }

export type QueryKeyTranslate = [
  'Translate',
  {
    source: string
    target: string
    text: string[]
  }
]

const queryFunction = async ({
  queryKey
}: QueryFunctionContext<QueryKeyTranslate>) => {
  const { source, target, text } = queryKey[1]

  const res = await apiTooot<Translations>({
    method: 'post',
    url: 'translate',
    body: { source, target, text }
  })
  haptics('Light')
  return res.body
}

const useTranslateQuery = ({
  options,
  ...queryKeyParams
}: QueryKeyTranslate[1] & {
  options?: UseQueryOptions<Translations, AxiosError>
}) => {
  const queryKey: QueryKeyTranslate = ['Translate', { ...queryKeyParams }]
  return useQuery(queryKey, queryFunction, { ...options, retry: false })
}

export { useTranslateQuery }
