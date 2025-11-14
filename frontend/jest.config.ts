import type { Config } from 'jest';

const config: Config = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],
  moduleDirectories: ["node_modules", "ClientApp"],
  testMatch: ['**/+(*.)+(spec).+(ts)']
};

export default config;