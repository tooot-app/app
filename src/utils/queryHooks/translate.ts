import apiGeneral from '@api/general'
import { AxiosError } from 'axios'
import { Constants } from 'react-native-unimodules'
import { useQuery, UseQueryOptions } from 'react-query'

export type QueryKeyTranslate = [
  'Translate',
  { toot: string; source: string; target: string }
]

const queryFunction = async ({ queryKey }: { queryKey: QueryKeyTranslate }) => {
  const { toot, source, target } = queryKey[1]

  const res = await apiGeneral<Translate.Translate>({
    domain: 'translate.tooot.app',
    method: 'post',
    url: 'translate',
    params: {
      api_key: Constants.manifest?.extra?.translateKey,
      q: toot,
      source,
      target
    }
  })
  return res.body.translatedText
}

const useTranslateQuery = ({
  options,
  ...queryKeyParams
}: QueryKeyTranslate[1] & {
  options?: UseQueryOptions<
    Translate.Translate['translatedText'],
    AxiosError,
    Translate.Translate['translatedText']
  >
}) => {
  const queryKey: QueryKeyTranslate = ['Translate', { ...queryKeyParams }]
  return useQuery(queryKey, queryFunction, options)
}

export { useTranslateQuery }
