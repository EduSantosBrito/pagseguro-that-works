
module.exports = {
    preset: './jest-preset.js',
    // testEnvironment: 'node',
    moduleNameMapper: {
        '~/types/(.*)': ['<rootDir>/src/types/$1'],
        '~/utils/(.*)': ['<rootDir>/src/utils/$1'],
        '~/validators/(.*)': ['<rootDir>/src/validators/$1'],
        '~/functions/(.*)': ['<rootDir>/src/functions/$1'],
    },
    testPathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/node_modules/'],
    testTimeout: 20000,
};
