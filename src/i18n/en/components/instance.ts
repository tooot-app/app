export default {
  server: {
    textInput: { placeholder: "Instance' domain" },
    privateInstance: 'Private instance, peeping not allowed',
    EULA: { base: 'I have read and agreed to ', EULA: 'EULA' },
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
    disclaimer: {
      base:
        "Logging in process uses system broswer that, your account informationo won't be visible to tooot app. Read more ",
      privacy: 'privacy policy'
    }
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
