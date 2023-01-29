// Central place appending _remote internal prop

export const appendRemote = {
  status: (status: Mastodon.Status) => ({
    ...status,
    ...(status.reblog && {
      reblog: {
        ...status.reblog,
        account: appendRemote.account(status.reblog.account),
        mentions: appendRemote.mentions(status.reblog.mentions)
      }
    }),
    account: appendRemote.account(status.account),
    mentions: appendRemote.mentions(status.mentions),
    _remote: true
  }),
  account: (account: Mastodon.Account) => ({
    ...account,
    _remote: true
  }),
  mentions: (mentions: Mastodon.Mention[]) =>
    mentions.map(mention => ({ ...mention, _remote: true }))
}
