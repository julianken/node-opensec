module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['dotenv/config'],
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.ts'],
  verbose: true,
};
