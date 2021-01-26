export default {
  server: {
    textInput: { placeholder: '输入社区服务器地址' },
    privateInstance: '非公开社区, 不能围观',
    EULA: { base: '我阅读并同意 ', EULA: '最终用户条款' },
    button: {
      local: '登录',
      remote: '围观'
    },
    information: {
      name: '社区名称',
      description: { heading: '社区简介', expandHint: '简介' },
      accounts: '用户总数',
      statuses: '嘟文总数',
      domains: '连结总数'
    },
    disclaimer: {
      base:
        '登录过程将使用系统浏览器，你的账号登录信息tooot应用无法读取。详见 ',
      privacy: '隐私条款'
    }
  },
  update: {
    local: {
      alert: {
        title: '此社区已登录',
        message: '你可以登录同个社区的另一个账号，不影响已登录的账号',
        buttons: {
          cancel: '$t(common:buttons.cancel)',
          continue: '继续'
        }
      }
    },
    remote: {
      succeed: '围观登记成功'
    }
  }
}
