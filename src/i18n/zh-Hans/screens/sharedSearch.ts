export default {
  heading: '对话',
  content: {
    header: {
      prefix: '搜索',
      placeholder: '些什么'
    },
    empty: {
      general:
        '输入关键词搜索<bold>$t(sharedSearch:content.sections.accounts)</bold>、<bold>$t(sharedSearch:content.sections.hashtags)</bold>或者<bold>$t(sharedSearch:content.sections.statuses)</bold>',
      advanced: {
        header: '高级搜索格式',
        example: {
          account:
            '$t(sharedSearch:content.header.prefix)$t(sharedSearch:content.sections.accounts)',
          hashtag:
            '$t(sharedSearch:content.header.prefix)$t(sharedSearch:content.sections.hashtags)',
          statusLink:
            '$t(sharedSearch:content.header.prefix)指定$t(sharedSearch:content.sections.statuses)',
          accountLink:
            '$t(sharedSearch:content.header.prefix)$t(sharedSearch:content.sections.accounts)'
        }
      }
    },
    sections: {
      accounts: '用户',
      hashtags: '话题标签',
      statuses: '嘟文'
    },
    notFound: '找不到 <bold>{{searchTerm}}</bold> 相关的 {{type}}'
  }
}
