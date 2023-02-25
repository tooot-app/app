// Central place appending _remote internal prop

export const appendRemote = {
  status: (status: Mastodon.Status, domain: string) => ({
    ...status,
    ...(status.reblog && {
      reblog: {
        ...status.reblog,
        account: appendRemote.account(status.reblog.account, domain),
        mentions: appendRemote.mentions(status.reblog.mentions, domain)
      }
    }),
    account: appendRemote.account(status.account, domain),
    mentions: appendRemote.mentions(status.mentions, domain),
    _remote: true
  }),
  account: (account: Mastodon.Account, domain: string) => ({
    ...account,
    _remote: domain
  }),
  mentions: (mentions: Mastodon.Mention[], domain: string) =>
    mentions?.map(mention => ({ ...mention, _remote: domain }))
}
