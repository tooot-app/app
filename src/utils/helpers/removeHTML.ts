import * as htmlparser2 from 'htmlparser2'

const removeHTML = (text: string): string => {
  if (!text) return ''

  let raw: string = ''

  const parser = new htmlparser2.Parser({
    ontext: (text: string) => {
      raw = raw + text
    },
    onclosetag: (tag: string) => {
      if (['p', 'br'].includes(tag)) raw = raw + `\n`
    }
  })

  parser.write(text)
  parser.end()

  return raw.replace(new RegExp(/\s$/), '')
}

export default removeHTML
