import chalk from 'chalk'

const ctx = new chalk.Instance({ level: 3 })

const log = (type: 'log' | 'warn' | 'error', func: string, message: string) => {
  switch (type) {
    case 'log':
      console.log(
        ctx.bgGrey.white.bold(' Start up ') +
          ' ' +
          ctx.bgGrey.black(` ${func} `) +
          ' ' +
          message
      )
      break
    case 'warn':
      console.warn(
        ctx.bgYellow.white.bold(' Start up ') +
          ' ' +
          ctx.bgYellowBright.black(` ${func} `) +
          ' ' +
          message
      )
      break
    case 'error':
      console.error(
        ctx.bgRed.white.bold(' Start up ') +
          ' ' +
          ctx.bgRedBright.black(` ${func} `) +
          ' ' +
          message
      )
      break
  }
}

export default log
