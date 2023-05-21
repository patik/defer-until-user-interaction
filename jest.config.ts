import type { Config } from 'jest'

const config: Config = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/tests/jest-setup.ts'],
    transform: {
        '^.+\\.(ts|tsx)$': [
            '@swc-node/jest',
            {
                dynamicImport: true,
                react: {
                    runtime: 'automatic',
                },
                swc: {
                    module: {
                        type: 'commonjs',
                    },
                },
            },
        ],
    },
}

export default config
