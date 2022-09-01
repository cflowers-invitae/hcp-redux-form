const createRollupConfig = require('@invitae/rollup-config-invitae')

module.exports = createRollupConfig({
  cssOutputFile: false,
  // required to recognize shared deps installed to workspace root
  sassIncludePaths: ['src', 'node_modules', '../../node_modules'],
})
