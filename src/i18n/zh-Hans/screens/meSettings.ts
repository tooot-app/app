export default {
  heading: '设置',
  content: {
    language: {
      heading: '切换语言',
      options: {
        en: 'English',
        'zh-Hans': '简体中文',
        cancel: '$t(common:buttons.cancel)'
      }
    },
    theme: {
      heading: '应用外观',
      options: {
        auto: '跟随系统',
        light: '浅色模式',
        dark: '深色模式',
        cancel: '$t(common:buttons.cancel)'
      }
    },
    browser: {
      heading: '外部链接',
      options: {
        internal: '应用内打开',
        external: '浏览器打开',
        cancel: '$t(common:buttons.cancel)'
      }
    },
    remote: {
      heading: '$t(meSettingsUpdateRemote:heading)',
      description: '外站只能浏览不能玩'
    },
    cache: {
      heading: '清空缓存',
      empty: '暂无缓存'
    },
    support: {
      heading: '赞助 tooot 开发'
    },
    review: {
      heading: '给 tooot 打分'
    },
    contact: {
      heading: '联系 tooot'
    },
    analytics: {
      heading: '帮助我们改进',
      description: '收集不与用户相关联的使用信息'
    },
    version: '版本 v{{version}}'
  }
}
