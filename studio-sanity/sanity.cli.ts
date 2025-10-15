import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: '3mt74yqx',
    dataset: 'production'
  },
  deployment: {
    appId: 'od8ovl1rykia7pl5thkoqzyx',
    autoUpdates: true,
  }
})
