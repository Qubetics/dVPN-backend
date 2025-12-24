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
        jest.resetModules(); // Clear singleton cache

        // Reload the mock constructor
        MockedSequelize = require("sequelize").Sequelize;

        // Import connection.ts AFTER mocks
        const handler = require("../src/connection");
        dbConnectionHandler = handler.default;
    });

    test("createDBConnection - success", async () => {
        const res = await dbConnectionHandler.createDBConnection();

        expect(res).toBe(true);

        const instance = MockedSequelize.mock.results[0].value;
        expect(instance.authenticate).toHaveBeenCalled();
    });

    test("releaseDBConnection closes the connection", async () => {
        const instance = MockedSequelize.mock.results[0].value;

        await dbConnectionHandler.releaseDBConnection();

        expect(instance.close).toHaveBeenCalled();
    });

    test("createDBConnection - error handling", async () => {
        const instance = MockedSequelize.mock.results[0].value;
        instance.authenticate.mockRejectedValue(new Error("Auth failed"));

        const consoleSpy = jest.spyOn(console, "log").mockImplementation();

        const res = await dbConnectionHandler.createDBConnection();

        expect(res).toBe(false);
        expect(consoleSpy).toHaveBeenCalled();

        consoleSpy.mockRestore();
    });

    test("createDBConnection - schema exists error", async () => {
        const instance = MockedSequelize.mock.results[0].value;
        instance.createSchema.mockRejectedValue({
            name: "SequelizeDatabaseError",
            message: "schema already exists"
        });

        const consoleSpy = jest.spyOn(console, "log").mockImplementation();

        await dbConnectionHandler.createDBConnection();

        // FIXED → message is the SECOND argument
        expect(consoleSpy).toHaveBeenCalledWith(
            expect.any(String),
            expect.stringContaining("already exists"),
            expect.any(String)
        );

        consoleSpy.mockRestore();
    });

    test("createDBConnection - other schema error", async () => {
        const instance = MockedSequelize.mock.results[0].value;
        instance.createSchema.mockRejectedValue(new Error("Schema creation failed"));

        const consoleSpy = jest.spyOn(console, "log").mockImplementation();

        await dbConnectionHandler.createDBConnection();

        // FIXED → message is the SECOND argument
        expect(consoleSpy).toHaveBeenCalledWith(
            expect.any(String),
            expect.stringContaining("creating schema"),
            expect.any(String)
        );

        consoleSpy.mockRestore();
    });

    test("getInstance should return singleton", () => {
        const instance1 = (dbConnectionHandler as any).constructor.getInstance();
        const instance2 = (dbConnectionHandler as any).constructor.getInstance();
        expect(instance1).toBe(instance2);
    });
});
