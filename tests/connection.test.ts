import { Sequelize } from "sequelize";

// Mock Sequelize BEFORE loading the connection file
jest.mock("sequelize", () => {
    return {
        Sequelize: jest.fn().mockImplementation(() => ({
            authenticate: jest.fn().mockResolvedValue(true),
            createSchema: jest.fn().mockResolvedValue(true),
            sync: jest.fn().mockResolvedValue(true),
            close: jest.fn().mockResolvedValue(true),
        })),
    };
});

describe("DBConnectionHandler", () => {
    let dbConnectionHandler: any;
    let MockedSequelize: any;

    beforeEach(() => {
        jest.resetModules(); // Clear singleton and cached mocks

        // Reload sequelize mock so we can track calls
        MockedSequelize = require("sequelize").Sequelize;

        // Re-import connection.ts AFTER mocks are applied
        const handler = require("../src/connection");
        dbConnectionHandler = handler.default;
    });

    test("createDBConnection - success", async () => {
        const res = await dbConnectionHandler.createDBConnection();

        expect(res).toBe(true);

        // Confirm authenticate() on the mock was called
        const instance = MockedSequelize.mock.results[0].value;
        expect(instance.authenticate).toHaveBeenCalled();
    });

    test("releaseDBConnection closes the connection", async () => {
        const instance = MockedSequelize.mock.results[0].value;

        await dbConnectionHandler.releaseDBConnection();

        expect(instance.close).toHaveBeenCalled();
    });
});
