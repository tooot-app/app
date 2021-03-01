export default {
  heading: '推送通知',
  content: {
    enable: {
      direct: '启用tooot推送通知',
      settings: '去系统设置启用'
    },
    global: {
      heading: '启用通知',
      description: '通知消息将经由tooot服务器转发'
    },
    decode: {
      heading: '显示通知内容',
      description:
        '经由tooot服务器中转的通知消息已被加密，但可以允许tooot服务器解密并转发消息。tooot消息服务器源码开源，且不留存任何日志。'
    },
    follow: {
      heading: '新关注者'
    },
    favourite: {
      heading: '嘟文被喜欢'
    },
    reblog: {
      heading: '嘟文被转嘟'
    },
    mention: {
      heading: '提及你'
    },
    poll: {
      heading: '投票'
    },
    howitworks: '了解通知消息转发如何工作'
  },
  error: {
    message: '推送服务器错误',
    description: '请在设置中重新尝试启用推送通知'
  }
}
