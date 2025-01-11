module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/controllers/**/*.ts',
    'src/models/**/*.ts',
    'src/middlewares/**/*.ts',
    'src/routes/**/*.ts',
  ],
  coverageDirectory: 'coverage',
};
