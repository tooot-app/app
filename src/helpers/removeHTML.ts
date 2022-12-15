import htmlparser2 from 'htmlparser2-without-node-native'

const removeHTML = (text: string): string => {
  let raw: string = ''

  const parser = new htmlparser2.Parser({
    ontext: (text: string) => {
      raw = raw + text
    }
  })

  parser.write(text)
  parser.end()

  return raw
}

export default removeHTML
