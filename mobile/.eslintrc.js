module.exports = {
  root: true,
  extends: '@react-native',
  ignorePatterns: [
    'android/.gradle/**',
    'android/.cxx/**',
    'android/app/build/**',
    'android/build/**',
    'node_modules/**',
  ],
  rules: {
    'react/no-unstable-nested-components': ['warn', {allowAsProps: true}],
  },
};
