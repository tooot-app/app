export default {
  server: {
    textInput: { placeholder: "Instance' domain" },
    button: {
      local: 'Login',
      remote: 'Peep'
    },
    information: {
      name: 'Name',
      description: { heading: 'Description', expandHint: 'description' },
      accounts: 'Users',
      statuses: 'Toots',
      domains: 'Universes'
    },
    disclaimer:
      "Logging in process uses system broswer that, your account informationo won't be visible to tooot app. Read more at: "
  },
  update: {
    local: {
      alert: {
        title: 'Logged in to this instance',
        message:
          'You can login to another account, keeping existing logged in account',
        buttons: {
          cancel: '$t(common:buttons.cancel)',
          continue: 'Continue'
        }
      }
    },
    remote: {
      succeed: 'Register peeping succeed'
    }
  }
}
