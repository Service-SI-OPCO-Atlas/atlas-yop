import type { Config } from 'jest';

export default async (): Promise<Config> => {
    return {
        rootDir: "src/yop",
        verbose: true,
        testEnvironment: "jest-environment-jsdom",
        transform: {
            "^.+\\.tsx?$": "ts-jest"
        },
    }
}
