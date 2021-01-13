module.exports = {
  roots: ['<rootDir>/tests'],
  transform: {
    '^.+\\.tsx?$': 'babel-jest',
  },
  testRegex: '(tests/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  globals: {
    'ts-jest': {
      diagnostics: false
    }
  },
  collectCoverageFrom: [
    "src/**/{!(errors|mod),}.ts"
  ]
}