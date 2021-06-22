import apiTooot from '@api/tooot'
import haptics from '@components/haptics'
import { AxiosError } from 'axios'
import { Buffer } from 'buffer'
import Constants from 'expo-constants'
import { useQuery, UseQueryOptions } from 'react-query'

type Translations = {
  provider: string
  sourceLanguage: string
  text: string[]
}

export type QueryKeyTranslate = [
  'Translate',
  {
    uri: string
    source: string
    target: string
    text: string[]
  }
]

const queryFunction = async ({ queryKey }: { queryKey: QueryKeyTranslate }) => {
  const { uri, source, target, text } = queryKey[1]

  const uriEncoded = Buffer.from(uri.replace(/https?:\/\//, ''))
    .toString('base64')
    .replace('+', '-')
    .replace('/', '_')
    .replace(/=+$/, '')
  const original = Buffer.from(JSON.stringify({ source, text })).toString(
    'base64'
  )

  const res = await apiTooot<Translations>({
    method: 'get',
    service: 'translate',
    url: `source/${uriEncoded}/target/${target}`,
    headers: { original }
  })
  haptics('Light')
  return res.body
}

const useTranslateQuery = ({
  options,
  ...queryKeyParams
}: QueryKeyTranslate[1] & {
  options?: UseQueryOptions<Translations, AxiosError, Translations>
}) => {
  const queryKey: QueryKeyTranslate = ['Translate', { ...queryKeyParams }]
  return useQuery(queryKey, queryFunction, { ...options, retry: false })
}

export { useTranslateQuery }
