import express from "express";
import cors from "cors";
import { Response, Request, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { Controller } from "@interfaces";
import './model/index';
import sendResponse from "./responses/response.helper";
import { RESPONSE_MESSAGES, STATUS_CODES } from "./constants/index";
import { log } from "./utils/helper.utils";
require('dotenv').config();

class App {
  public app: express.Application;

  constructor(controllers: Controller[]) {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeControllers(controllers);
  }
  /**
   * bind the port and start listening for requests
   */
  public listen(): void {
    const port = process.env.PORT ? Number(process.env.PORT) : 7200;

    this.app
      .listen(port, () => {
        log.green(`App listening on port ${port}`);
      })
      .on('error', (err: any) => {
        log.red(`Failed to start server on port ${port}:`, err);
        process.exit(1);
      });
  }

  /**
   * only return the http server after binding the port and start listing for requests
   * if you try to call without calling the listen then it return default null value as server
   * @return http server instance
   */
  public getServer(): express.Application {
    return this.app;
  }
  private initializeMiddlewares() {
    this.app.use(
      cors({
        credentials: true,
        origin: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
        preflightContinue: false,
      })
    );
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(cookieParser());
    this.app.use(function onError(err, req: Request, res: any, next: NextFunction) {
      // The error id is attached to `res.sentry` to be returned
      // and optionally displayed to the user for support.
      res.statusCode = 500;
      res.end(res.sentry + "\n");
      return;
    });
  }

  private initializeControllers(controllers: Controller[]) {
    // Check api status
    this.app.get("/", (req: Request, res: Response) => {
      sendResponse(res, { message: RESPONSE_MESSAGES.API_SERVICE })
    });
    // Setup the controllers
    controllers.forEach((controller) => {
      this.app.use('/api', controller.router);
    });
    //Unknown rotues handler
    this.app.all("/*path", (req: Request, res: Response) => {
      sendResponse(res, {
        status: STATUS_CODES.NOTFOUND,
        message: RESPONSE_MESSAGES.ROUTE_404,
      })
    });
  }
}

export default App;