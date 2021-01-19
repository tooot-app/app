export default {
  heading: {
    left: {
      button: '退出编辑',
      alert: {
        title: '确认退出编辑？',
        buttons: {
          exit: '退出编辑',
          continue: '继续编辑'
        }
      }
    },
    right: {
      button: {
        default: '发嘟嘟',
        conversation: '发私信',
        reply: '发布回复',
        edit: '发嘟嘟'
      },
      alert: {
        title: '发布失败',
        button: '返回重试'
      }
    }
  },
  content: {
    root: {
      header: {
        postingAs: '以 @{{acct}}@{{domain}} 发嘟',
        spoilerInput: {
          placeholder: '折叠部分的警告信息'
        },
        textInput: {
          placeholder: '想说点什么呢'
        }
      },
      footer: {
        attachments: {
          sensitive: '标记附件为敏感内容'
        },
        poll: {
          option: {
            placeholder: {
              single: '单选项',
              multiple: '多选项'
            }
          },
          multiple: {
            heading: '可选项',
            options: {
              single: '单选',
              multiple: '多选',
              cancel: '$t(common:buttons.cancel)'
            }
          },
          expiration: {
            heading: '有效期',
            options: {
              '300': '5分钟',
              '1800': '30分钟',
              '3600': '1小时',
              '21600': '6小时',
              '86400': '1天',
              '259200': '3天',
              '604800': '7天',
              cancel: '$t(common:buttons.cancel)'
            }
          }
        }
      },
      actions: {
        attachment: {
          actions: {
            options: {
              library: '从相册上传',
              photo: '拍摄上传',
              cancel: '$t(common:buttons.cancel)'
            },
            library: {
              alert: {
                title: '无读取权限',
                message: '需要读取相册权限才能上传附件',
                buttons: {
                  settings: '去更新设置',
                  cancel: '取消上传'
                }
              }
            },
            photo: {
              alert: {
                title: '无拍照权限',
                message: '需要使用相机权限才能上传附件',
                buttons: {
                  settings: '去更新设置',
                  cancel: '取消上传'
                }
              }
            }
          },
          failed: {
            alert: {
              title: '上传失败',
              button: '返回重试'
            }
          }
        },
        visibility: {
          title: '嘟文可见范围',
          options: {
            public: '公开',
            unlisted: '不公开',
            private: '仅关注者',
            direct: '私信',
            cancel: '$t(common:buttons.cancel)'
          }
        }
      }
    },
    editAttachment: {
      header: {
        left: '取消修改',
        right: {
          button: '应用修改',
          succeed: {
            title: '修改成功',
            button: '好的'
          },
          failed: {
            title: '修改失败',
            button: '返回重试'
          }
        }
      },
      content: {
        altText: {
          heading: '为附件添加文字说明',
          placeholder:
            '你可以为附件添加文字说明，以便更多人可以查看他们（包括视力障碍或视力受损人士）。\n\n优质的描述应该简洁明了，但要准确地描述照片中的内容，以便用户理解其含义。'
        },
        imageFocus: '在预览图上拖动圆圈，以选择缩略图的焦点'
      }
    }
  }
}
