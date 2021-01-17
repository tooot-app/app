export default {
  empty: {
    error: {
      message: '加载错误',
      button: '重试'
    },
    success: {
      message: '🈳️🈚️1一物'
    }
  },
  shared: {
    actioned: {
      pinned: '置顶',
      favourite: '{{name}} 喜欢了你的嘟嘟',
      status: '{{name}} 刚刚发嘟',
      follow: '{{name}} 开始关注你',
      follow_request: '{{name}} 请求关注',
      poll: '您参与的投票已结束',
      reblog: {
        default: '{{name}} 转嘟了',
        notification: '{{name}} 转嘟了您的嘟文'
      }
    },
    actions: {
      favourite: {
        function: '喜欢嘟文'
        // button: '隐藏 {{acct}} 的嘟文'
      },
      reblog: {
        function: '转嘟'
        // button: '屏蔽 {{acct}}'
      },
      bookmark: {
        function: '收藏嘟文'
        // button: '举报 {{acct}}'
      }
    },
    attachment: {
      sensitive: {
        button: '显示敏感内容'
      },
      unsupported: {
        text: '文件读取错误',
        button: '尝试远程链接'
      }
    },
    content: {
      expandHint: '隐藏内容'
    },
    end: {
      message: '居然刷到底了，喝杯 <0 /> 吧'
    },
    header: {
      shared: {
        application: '发自于 {{application}}'
      },
      conversation: {
        delete: {
          function: '删除私信'
        }
      },
      default: {
        actions: {
          account: {
            heading: '关于用户',
            mute: {
              function: '隐藏 @{{acct}} 的嘟文',
              button: '隐藏 @{{acct}} 的嘟文'
            },
            block: {
              function: '屏蔽 @{{acct}}',
              button: '屏蔽 @{{acct}}'
            },
            report: {
              function: '举报 @{{acct}}',
              button: '举报 @{{acct}}'
            }
          },
          domain: {
            heading: '关于域名',
            block: {
              function: '屏蔽域名',
              button: '屏蔽域名 {{domain}}'
            }
          },
          status: {
            heading: '关于嘟嘟',
            delete: {
              function: '删除',
              button: '删除次条嘟文'
            },
            edit: {
              function: '删除',
              button: '删除并重新编辑次条嘟文',
              alert: {
                title: '确认删除嘟嘟？',
                message:
                  '你确定要删除这条嘟文并重新编辑它吗？所有相关的转嘟和喜欢都会被清除，回复将会失去关联。',
                confirm: '删除并重新编辑'
              }
            },
            mute: {
              function: '静音',
              button: {
                positive: '静音此条嘟文及对话',
                negative: '取消静音此条嘟文及对话'
              }
            },
            pin: {
              function: '置顶',
              button: {
                positive: '置顶此条嘟文',
                negative: '取消置顶此条嘟文'
              }
            }
          }
        }
      }
    },
    poll: {
      meta: {
        button: {
          vote: '投票',
          refresh: '刷新'
        },
        count: {
          voters: '已投{{count}}人 • ',
          votes: '{{count}}票 • '
        },
        expiration: {
          expired: '投票已结束',
          until: '<0 />截止'
        }
      }
    }
  }
}
