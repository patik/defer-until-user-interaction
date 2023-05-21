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
    // Needs to be high enough for the hook's 10 second time to complete and for the test component to rerender
    testTimeout: 15000,
}

export default config
