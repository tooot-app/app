import apiGeneral from '@api/general'
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

export const TRANSLATE_SERVER = __DEV__
  ? 'testtranslate.tooot.app'
  : 'translate.tooot.app'

const queryFunction = async ({ queryKey }: { queryKey: QueryKeyTranslate }) => {
  const key = Constants.manifest.extra?.translateKey
  if (!key) {
    return Promise.reject()
  }

  const { uri, source, target, text } = queryKey[1]

  const uriEncoded = Buffer.from(uri.replace(/https?:\/\//, ''))
    .toString('base64')
    .replace('+', '-')
    .replace('/', '_')
    .replace(/=+$/, '')
  const original = Buffer.from(JSON.stringify({ source, text })).toString(
    'base64'
  )

  const res = await apiGeneral<Translations>({
    domain: TRANSLATE_SERVER,
    method: 'get',
    url: `v1/translate/${uriEncoded}/${target}`,
    headers: { key, original }
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
