function flushPromises() {
    return new Promise(setImmediate);
}

jest.mock("../src/config", () => ({
    initiate: jest.fn().mockResolvedValue(true),
}));

jest.mock("../src/connection", () => ({
    __esModule: true,
    default: {
        createDBConnection: jest.fn().mockResolvedValue(true),
    },
}));

jest.mock("../src/helpers/redis.helper", () => ({
    __esModule: true,
    default: {
        connectRedis: jest.fn().mockResolvedValue(true),
    },
}));

const mockListen = jest.fn();
const mockAppConstructor = jest.fn().mockImplementation(() => ({
    listen: mockListen,
}));

jest.mock("../src/app", () => ({
    __esModule: true,
    default: mockAppConstructor,
}));

jest.mock("../src/controllers/user.controller", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("../src/controllers/node.controller", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("../src/controllers/user-session.controller", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("../src/controllers/subscription.controller", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("../src/controllers/app.controller", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("../src/controllers/plan.controller", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("../src/controllers/provider.controller", () => ({ __esModule: true, default: jest.fn() }));

jest.mock("../src/utils/helper.utils", () => ({
    log: { red: jest.fn() },
}));

describe("server.ts", () => {
    beforeEach(() => {
        jest.resetModules(); // MUST reset cached imports
        jest.clearAllMocks();
    });

    test("should log Postgres error when DB connection fails", async () => {
        const db = require("../src/connection").default;
        db.createDBConnection.mockResolvedValueOnce(false);

        const log = require("../src/utils/helper.utils").log;

        await import("../src/server");
        await flushPromises();

        expect(log.red).toHaveBeenCalledTimes(1);
        expect(log.red).toHaveBeenCalledWith(
            expect.stringContaining("postgres"), // matches ERR.POSTGRES_CONN
            expect.any(String)
        );
    });

    test("should log Redis error when Redis connection fails", async () => {
        // DB works
        const db = require("../src/connection").default;
        db.createDBConnection.mockResolvedValueOnce(true);

        // Redis fails
        const redis = require("../src/helpers/redis.helper").default;
        redis.connectRedis.mockResolvedValueOnce(false);

        const log = require("../src/utils/helper.utils").log;

        await import("../src/server");
        await flushPromises();

        expect(log.red).toHaveBeenCalledTimes(1);
        expect(log.red).toHaveBeenCalledWith(
            expect.stringContaining("Redis"),
            expect.any(String)
        );
    });

    test("should NOT log error when both connections succeed", async () => {
        const log = require("../src/utils/helper.utils").log;

        // Ensure all succeed
        require("../src/connection").default.createDBConnection.mockResolvedValueOnce(true);
        require("../src/helpers/redis.helper").default.connectRedis.mockResolvedValueOnce(true);

        await import("../src/server");
        await flushPromises();

        expect(log.red).not.toHaveBeenCalled();
    });
});
