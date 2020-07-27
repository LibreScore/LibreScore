module.exports = {
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
  verbose: true,
  transform: {
    '^.+\\.vue$': 'vue-jest',
  },
}
