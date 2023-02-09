import { mapEnvironment } from '@utils/helpers/checkEnvironment'
import { GLOBAL } from '@utils/storage'
import { setGlobalStorage } from '@utils/storage/actions'
import axios from 'axios'
import parse from 'url-parse'
import { userAgent } from '.'

const list = [
  'n61owz4leck',
  'z9skyp2f0m',
  'nc2dqtyxevj',
  'tgl97fgudrf',
  'eo2sj0ut2s',
  'a75auwihvyi',
  'vzkpud5y5b',
  '3uivf7yyex',
  'pxfoa1wbor',
  '3cor5jempc',
  '9o32znuepr',
  '9ayt1l2dzpi',
  '60iu4rz8js',
  'dzoa1lbxbv',
  '82rpiiqw21',
  'fblij1c9gyl',
  'wk2x048g8gl',
  '9x91yrbtmn',
  'dgu5p7eif6',
  'uftwyhrkgrh',
  'vv5hay15vjk',
  'ooj9ihtyur',
  'o8r7phzd58',
  'pujwyg269s',
  'l6yq5nr8lv',
  'ocyrlfmdnl',
  'rdtpeip5e2',
  'ykzb5784js',
  'm34z7j5us1i',
  'tqsfr0orqa',
  '8ncrt0mifa',
  'ygce2fdmsm',
  '22vk7csljz',
  '7mmb6hrih1',
  'grla5cpgau',
  '0vygyvs4k7',
  '1texbe32sf',
  'ckwvauiiol',
  'qkxryrbpxx',
  'ptb19c0ks9g',
  '3bpe76o6stg',
  'd507ejce9g',
  'jpul5v2mqej',
  '6m5uxemc79',
  'wxbtoo9t3p',
  '8qco3d0idh',
  'u00c2xiabvf',
  'hutkqwrcy8',
  't6vrkzhpzo',
  'wy6e529mnb',
  'kzzrlfa59pg',
  'mmo4sv4a7s',
  'u0dishl20k',
  '8qyx25bq3u',
  'd3mucdzlu1',
  'y123m81vsjl',
  '51opvzdo6k',
  'r4z333th9u',
  'q77hl0ggfr',
  'bsk1f2wi52g',
  'eubnxpv0pz',
  'h11pk7qm8i',
  'brhxw45vd5',
  'vtnvlsrn1z',
  '0q5w0hhzb5',
  'vq2rz02ayf'
]

export const CONNECT_DOMAIN = (index?: number) =>
  mapEnvironment({
    release: `${list[index || Math.floor(Math.random() * list.length)]}.tooot.app`,
    candidate: 'connect-candidate.tooot.app',
    development: 'connect-development.tooot.app'
  })

export const connectMedia = (args?: {
  uri?: string
}): { uri?: string; headers?: { 'x-tooot-domain': string } } => {
  if (GLOBAL.connect) {
    if (args?.uri) {
      const host = parse(args.uri).host
      return {
        ...args,
        uri: args.uri.replace(
          host,
          CONNECT_DOMAIN(
            args.uri
              .split('')
              .map(i => i.charCodeAt(0))
              .reduce((a, b) => a + b, 0) %
              (list.length + 1)
          )
        ),
        headers: { 'x-tooot-domain': host }
      }
    } else {
      return { ...args }
    }
  } else {
    return { ...args }
  }
}

export const connectVerify = () =>
  axios({
    method: 'get',
    baseURL: `https://${CONNECT_DOMAIN()}`,
    url: 'verify',
    headers: { ...userAgent }
  }).catch(err => {
    GLOBAL.connect = false
    setGlobalStorage('app.connect', false)
    return Promise.reject(err)
  })
