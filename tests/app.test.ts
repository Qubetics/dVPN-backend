import express from "express";
import request from "supertest";
import App from "../src/app";
import  Controller  from "../src/interfaces/controller.interfaces";

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
            return { close: jest.fn() } as any;
        });

        appInstance.listen();
        expect(mockListen).toHaveBeenCalled();
    });
});
