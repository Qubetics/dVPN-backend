import AppController from '../../src/controllers/app.controller';
import appHelpers from '../../src/controller-helpers/app.helpers';
import sendResponse from '../../src/responses/response.helper';
import { STATUS_CODES } from '../../src/constants/index';
import * as express from 'express';

// Mock dependencies
jest.mock('../../src/controller-helpers/app.helpers', () => ({
    getApplicationVersion: jest.fn(),
    getChainURL: jest.fn(),
}));

jest.mock('../../src/responses/response.helper', () => jest.fn());

jest.mock('../../src/middleware/sessionCheck', () => ({
    sessionCheck: (req: any, res: any, next: any) => next(),
}));

describe('AppController', () => {
    let appController: AppController;
    let req: any;
    let res: any;

    beforeEach(() => {
        appController = new AppController();
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
        jest.clearAllMocks();
    });

    describe('getApplicationVersion', () => {
        it('should call appHelpers.getApplicationVersion and sendResponse', () => {
            const mockResponse = {
                status: STATUS_CODES.SUCCESS,
                message: 'Success',
                data: { version: '1.0.0' }
            };
            (appHelpers.getApplicationVersion as jest.Mock).mockReturnValue(mockResponse);

            // Access private method via any cast or by simulating route call if possible, 
            // but for unit testing controller methods directly is easier if they were public.
            // Since they are private, we can test them by calling them directly using `any` cast
            // or we can test via supertest if we set up the app.
            // Given the structure, I'll access the private method for unit testing.
            (appController as any).getApplicationVersion(req, res);

            expect(appHelpers.getApplicationVersion).toHaveBeenCalled();
            expect(sendResponse).toHaveBeenCalledWith(res, mockResponse);
        });
    });

    describe('getChainURL', () => {
        it('should call appHelpers.getChainURL and sendResponse', () => {
            const mockResponse = {
                status: STATUS_CODES.SUCCESS,
                message: 'Success',
                data: { ChainURL: 'http://localhost' }
            };
            (appHelpers.getChainURL as jest.Mock).mockReturnValue(mockResponse);

            (appController as any).getChainURL(req, res);

            expect(appHelpers.getChainURL).toHaveBeenCalled();
            expect(sendResponse).toHaveBeenCalledWith(res, mockResponse);
        });
    });
});
