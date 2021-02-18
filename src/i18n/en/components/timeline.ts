export default {
  empty: {
    error: {
      message: 'Loading error',
      button: 'Retry'
    },
    success: {
      message: 'Timeline empty'
    }
  },
  end: {
    message: 'The end, what about a cup of <0 />'
  },
  refresh: {
    fetchPreviousPage: 'Newer from here',
    refetch: 'To latest'
  },
  shared: {
    actioned: {
      pinned: 'Pinned',
      favourite: '{{name}} favourited your toot',
      status: '{{name}} just posted',
      follow: '{{name}} followed you',
      follow_request: '{{name}} requested following you',
      poll: 'A poll you have voted in has ended',
      reblog: {
        default: '{{name}} boosted',
        notification: '{{name}} boosted your toot'
      }
    },
    actions: {
      favourited: {
        function: 'Favourite toot'
      },
      reblogged: {
        function: 'Boost toot'
      },
      bookmarked: {
        function: 'Bookmark toot'
      }
    },
    attachment: {
      sensitive: {
        button: 'Show sensitive media'
      },
      unsupported: {
        text: 'Loading error',
        button: 'Try remote link'
      }
    },
    content: {
      expandHint: 'hidden content'
    },
    header: {
      shared: {
        application: 'Tooted with {{application}}'
      },
      conversation: {
        withAccounts: 'With',
        delete: {
          function: 'Delete direct message'
        }
      },
      actions: {
        account: {
          heading: 'About user',
          mute: {
            function: 'Mute user',
            button: 'Mute @{{acct}}'
          },
          block: {
            function: 'Block user',
            button: 'Block @{{acct}}'
          },
          reports: {
            function: 'Report user',
            button: 'Report @{{acct}}'
          }
        },
        domain: {
          heading: 'About instance',
          block: {
            function: 'Block instance',
            button: 'Block instance {{domain}}'
          },
          alert: {
            title: 'Confirm blocking {{domain}} ?',
            message:
              'Mostly you can mute or block certain user.\n\nAfter blocking instance, all its content including followers from this instance will be removed!',
            buttons: {
              confirm: 'Confirm blocking',
              cancel: '$t(common:buttons.cancel)'
            }
          }
        },
        share: {
          status: { heading: 'Share toot', button: 'Share link to this toot' },
          account: { heading: 'Share user', button: 'Share link to this user' }
        },
        status: {
          heading: 'About toot',
          delete: {
            function: 'Delete toot',
            button: 'Delete this toot'
          },
          edit: {
            function: 'Delete toot',
            button: 'Delete and re-draft',
            alert: {
              title: 'Confirm deleting toot?',
              message:
                'Are you sure to delete and re-draft this toot? All boosts and favourites will be cleared, including all replies.',
              buttons: {
                confirm: 'Confirm deleting',
                cancel: '$t(common:buttons.cancel)'
              }
            }
          },
          mute: {
            function: 'Mute toot',
            button: {
              positive: 'Mute this toot and replies',
              negative: 'Unmute this toot and replies'
            }
          },
          pin: {
            function: 'Pin',
            button: {
              positive: 'Pin this toot',
              negative: 'Unpin this toot'
            }
          }
        }
      }
    },
    poll: {
      meta: {
        button: {
          vote: 'Vote',
          refresh: 'Refresh'
        },
        count: {
          voters: '{{count}} user voted • ',
          voters_plural: '{{count}} users voted • ',
          votes: '{{count}} vote • ',
          votes_plural: '{{count}} votes • '
        },
        expiration: {
          expired: 'Vote expired',
          until: 'Open until <0 />'
        }
      }
    }
  }
}
