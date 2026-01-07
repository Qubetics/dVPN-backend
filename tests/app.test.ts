import express from "express";
import request from "supertest";
import App from "../src/app";
import Controller from "../src/interfaces/controller.interfaces";

// Mock controller
const mockRouter: express.Router = express.Router();
mockRouter.get("/test", (req: express.Request, res: express.Response) => {
    res.json({ ok: true });
});

const mockController: Controller = {
    path: "/test",
    router: mockRouter,
};

describe("App Class", () => {
    let appInstance: App;
    let server: express.Application;

    beforeEach(() => {
        appInstance = new App([mockController]);
        server = appInstance.getServer();
    });

    test("GET / should return API service message", async () => {
        const res = await request(server).get("/");
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("message");
    });

    test("Should initialize controllers and respond from /api/test", async () => {
        const res = await request(server).get("/api/test");
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ ok: true });
    });

    test("Should return 404 response for unknown routes", async () => {
        const res = await request(server).get("/unknown/path");
        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty("message");
    });

    test("getServer() should return express application", () => {
        expect(server).toBeInstanceOf(Function); // Express app is a function
        expect(typeof server.use).toBe("function");
    });

    test("listen() should start server without crashing", () => {
        const mockListen = jest.spyOn(appInstance.app, "listen").mockImplementation(() => {
            return {
                close: jest.fn(),
                on: jest.fn().mockReturnThis()
            } as any;
        });

        appInstance.listen();
        expect(mockListen).toHaveBeenCalled();
    });

    test("listen() should use default port if process.env.PORT is undefined", () => {
        const originalPort = process.env.PORT;
        delete process.env.PORT;

        const mockListen = jest.spyOn(appInstance.app, "listen").mockImplementation((port: any, callback: any) => {
            if (callback) callback();
            return {
                close: jest.fn(),
                on: jest.fn().mockReturnThis()
            } as any;
        });

        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

        appInstance.listen();

        expect(mockListen).toHaveBeenCalledWith(7200, expect.any(Function));
        // log.green uses ANSI color codes, so the actual call is: console.log('\x1b[32m', 'App listening on port 7200', '\x1b[39m')
        expect(consoleSpy).toHaveBeenCalledWith('\x1b[32m', 'App listening on port 7200', '\x1b[39m');

        process.env.PORT = originalPort;
        consoleSpy.mockRestore();
    });

    test("Should handle errors via middleware", async () => {
        // Add a route that throws an error
        appInstance.app.get("/error", (req, res, next) => {
            const error: any = new Error("Test Error");
            next(error);
        });

        const res = await request(server).get("/error");
        expect(res.status).toBe(404);
    });
});
