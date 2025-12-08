import SubscriptionController from '../../src/controllers/subscription.controller';
import subscriptionHelper from '../../src/controller-helpers/subscription.helper';
import sendResponse from '../../src/responses/response.helper';
import { STATUS_CODES, RESPONSE_MESSAGES } from '../../src/constants/index';

// Mock dependencies
jest.mock('../../src/controller-helpers/subscription.helper', () => ({
    getSubscritptionsList: jest.fn(),
    getRenewSubscriptions: jest.fn(),
}));

jest.mock('../../src/responses/response.helper', () => jest.fn());

jest.mock('../../src/middleware/sessionCheck', () => ({
    sessionCheck: (req: any, res: any, next: any) => next(),
}));

describe('SubscriptionController', () => {
    let subscriptionController: SubscriptionController;
    let req: any;
    let res: any;

    beforeEach(() => {
        subscriptionController = new SubscriptionController();
        req = {
            query: {},
            user: { wallet_address: 'wallet1' }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
        jest.clearAllMocks();
    });

    describe('Route Initialization', () => {
        it('should initialize routes correctly', () => {
            expect(subscriptionController.path).toBe('/subscription');
            expect(subscriptionController.router).toBeDefined();
        });

        it('should have GET /subscription/ route', () => {
            const routes = subscriptionController.router.stack
                .filter((layer: any) => layer.route)
                .map((layer: any) => ({
                    path: layer.route.path,
                    method: Object.keys(layer.route.methods)[0]
                }));

            expect(routes).toContainEqual({
                path: '/subscription/',
                method: 'get'
            });
        });

        it('should have GET /subscription/renew route', () => {
            const routes = subscriptionController.router.stack
                .filter((layer: any) => layer.route)
                .map((layer: any) => ({
                    path: layer.route.path,
                    method: Object.keys(layer.route.methods)[0]
                }));

            expect(routes).toContainEqual({
                path: '/subscription/renew',
                method: 'get'
            });
        });
    });

    describe('getSubscritptionsList', () => {
        it('should call subscriptionHelper.getSubscritptionsList with correct parameters', async () => {
            req.query = { limit: '10', page: '1', order: 'ASC' };
            const mockResponse = {
                status: STATUS_CODES.SUCCESS,
                data: { subscriptions: [], total: 0 },
                error: false,
                message: RESPONSE_MESSAGES.FETCH_DATA_SUCCESS
            };
            (subscriptionHelper.getSubscritptionsList as jest.Mock).mockResolvedValue(mockResponse);

            await (subscriptionController as any).getSubscritptionsList(req, res);

            expect(subscriptionHelper.getSubscritptionsList).toHaveBeenCalledWith('wallet1', 10, 1, 'ASC');
            expect(sendResponse).toHaveBeenCalledWith(res, mockResponse);
        });

        it('should handle missing query parameters with defaults', async () => {
            req.query = {};
            const mockResponse = {
                status: STATUS_CODES.SUCCESS,
                data: { subscriptions: [], total: 0 },
                error: false,
                message: RESPONSE_MESSAGES.FETCH_DATA_SUCCESS
            };
            (subscriptionHelper.getSubscritptionsList as jest.Mock).mockResolvedValue(mockResponse);

            await (subscriptionController as any).getSubscritptionsList(req, res);

            expect(subscriptionHelper.getSubscritptionsList).toHaveBeenCalledWith(
                'wallet1',
                NaN,  // Number(undefined) = NaN
                NaN,
                'undefined'  // String(undefined) = 'undefined'
            );
            expect(sendResponse).toHaveBeenCalledWith(res, mockResponse);
        });

        it('should handle invalid numeric query parameters', async () => {
            req.query = { limit: 'invalid', page: 'invalid', order: 'DESC' };
            const mockResponse = {
                status: STATUS_CODES.SUCCESS,
                data: { subscriptions: [], total: 0 },
                error: false,
                message: RESPONSE_MESSAGES.FETCH_DATA_SUCCESS
            };
            (subscriptionHelper.getSubscritptionsList as jest.Mock).mockResolvedValue(mockResponse);

            await (subscriptionController as any).getSubscritptionsList(req, res);

            expect(subscriptionHelper.getSubscritptionsList).toHaveBeenCalledWith(
                'wallet1',
                NaN,  // Number('invalid') = NaN
                NaN,
                'DESC'
            );
            expect(sendResponse).toHaveBeenCalledWith(res, mockResponse);
        });

        it('should handle large pagination values', async () => {
            req.query = { limit: '100', page: '999', order: 'ASC' };
            const mockResponse = {
                status: STATUS_CODES.SUCCESS,
                data: { subscriptions: [], total: 0 },
                error: false,
                message: RESPONSE_MESSAGES.FETCH_DATA_SUCCESS
            };
            (subscriptionHelper.getSubscritptionsList as jest.Mock).mockResolvedValue(mockResponse);

            await (subscriptionController as any).getSubscritptionsList(req, res);

            expect(subscriptionHelper.getSubscritptionsList).toHaveBeenCalledWith('wallet1', 100, 999, 'ASC');
            expect(sendResponse).toHaveBeenCalledWith(res, mockResponse);
        });

        it('should handle error response from helper', async () => {
            req.query = { limit: '10', page: '1', order: 'ASC' };
            const mockErrorResponse = {
                status: STATUS_CODES.INTERNALSERVER,
                message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
                error: true
            };
            (subscriptionHelper.getSubscritptionsList as jest.Mock).mockResolvedValue(mockErrorResponse);

            await (subscriptionController as any).getSubscritptionsList(req, res);

            expect(sendResponse).toHaveBeenCalledWith(res, mockErrorResponse);
        });

        it('should extract wallet_address from req.user', async () => {
            req.query = { limit: '10', page: '1', order: 'ASC' };
            req.user = { wallet_address: 'custom_wallet_address' };
            const mockResponse = {
                status: STATUS_CODES.SUCCESS,
                data: { subscriptions: [], total: 0 },
                error: false,
                message: RESPONSE_MESSAGES.FETCH_DATA_SUCCESS
            };
            (subscriptionHelper.getSubscritptionsList as jest.Mock).mockResolvedValue(mockResponse);

            await (subscriptionController as any).getSubscritptionsList(req, res);

            expect(subscriptionHelper.getSubscritptionsList).toHaveBeenCalledWith('custom_wallet_address', 10, 1, 'ASC');
        });
    });

    describe('getRenewSubscriptions', () => {
        it('should call subscriptionHelper.getRenewSubscriptions with correct parameters', async () => {
            req.query = { limit: '10', page: '1', order: 'ASC' };
            const mockResponse = {
                status: STATUS_CODES.SUCCESS,
                data: { subscriptions: [], total: 0 },
                error: false,
                message: RESPONSE_MESSAGES.FETCH_DATA_SUCCESS
            };
            (subscriptionHelper.getRenewSubscriptions as jest.Mock).mockResolvedValue(mockResponse);

            await (subscriptionController as any).getRenewSubscriptions(req, res);

            expect(subscriptionHelper.getRenewSubscriptions).toHaveBeenCalledWith('wallet1', 10, 1, 'ASC');
            expect(sendResponse).toHaveBeenCalledWith(res, mockResponse);
        });

        it('should handle missing query parameters with defaults', async () => {
            req.query = {};
            const mockResponse = {
                status: STATUS_CODES.SUCCESS,
                data: { subscriptions: [], total: 0 },
                error: false,
                message: RESPONSE_MESSAGES.FETCH_DATA_SUCCESS
            };
            (subscriptionHelper.getRenewSubscriptions as jest.Mock).mockResolvedValue(mockResponse);

            await (subscriptionController as any).getRenewSubscriptions(req, res);

            expect(subscriptionHelper.getRenewSubscriptions).toHaveBeenCalledWith(
                'wallet1',
                NaN,
                NaN,
                'undefined'
            );
            expect(sendResponse).toHaveBeenCalledWith(res, mockResponse);
        });

        it('should handle invalid numeric query parameters', async () => {
            req.query = { limit: 'abc', page: 'xyz', order: 'DESC' };
            const mockResponse = {
                status: STATUS_CODES.SUCCESS,
                data: { subscriptions: [], total: 0 },
                error: false,
                message: RESPONSE_MESSAGES.FETCH_DATA_SUCCESS
            };
            (subscriptionHelper.getRenewSubscriptions as jest.Mock).mockResolvedValue(mockResponse);

            await (subscriptionController as any).getRenewSubscriptions(req, res);

            expect(subscriptionHelper.getRenewSubscriptions).toHaveBeenCalledWith(
                'wallet1',
                NaN,
                NaN,
                'DESC'
            );
            expect(sendResponse).toHaveBeenCalledWith(res, mockResponse);
        });

        it('should handle DESC order parameter', async () => {
            req.query = { limit: '20', page: '2', order: 'DESC' };
            const mockResponse = {
                status: STATUS_CODES.SUCCESS,
                data: { subscriptions: [], total: 0 },
                error: false,
                message: RESPONSE_MESSAGES.FETCH_DATA_SUCCESS
            };
            (subscriptionHelper.getRenewSubscriptions as jest.Mock).mockResolvedValue(mockResponse);

            await (subscriptionController as any).getRenewSubscriptions(req, res);

            expect(subscriptionHelper.getRenewSubscriptions).toHaveBeenCalledWith('wallet1', 20, 2, 'DESC');
            expect(sendResponse).toHaveBeenCalledWith(res, mockResponse);
        });

        it('should handle error response from helper', async () => {
            req.query = { limit: '10', page: '1', order: 'ASC' };
            const mockErrorResponse = {
                status: STATUS_CODES.INTERNALSERVER,
                message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
                error: true
            };
            (subscriptionHelper.getRenewSubscriptions as jest.Mock).mockResolvedValue(mockErrorResponse);

            await (subscriptionController as any).getRenewSubscriptions(req, res);

            expect(sendResponse).toHaveBeenCalledWith(res, mockErrorResponse);
        });

        it('should extract wallet_address from req.user', async () => {
            req.query = { limit: '15', page: '3', order: 'ASC' };
            req.user = { wallet_address: 'another_wallet' };
            const mockResponse = {
                status: STATUS_CODES.SUCCESS,
                data: { subscriptions: [], total: 0 },
                error: false,
                message: RESPONSE_MESSAGES.FETCH_DATA_SUCCESS
            };
            (subscriptionHelper.getRenewSubscriptions as jest.Mock).mockResolvedValue(mockResponse);

            await (subscriptionController as any).getRenewSubscriptions(req, res);

            expect(subscriptionHelper.getRenewSubscriptions).toHaveBeenCalledWith('another_wallet', 15, 3, 'ASC');
        });

        it('should handle successful response with renew subscriptions data', async () => {
            req.query = { limit: '10', page: '1', order: 'ASC' };
            const mockSubscriptions = [
                { id: 1, plan_id: 'plan1', isRenew: true },
                { id: 2, plan_id: 'plan2', isRenew: true }
            ];
            const mockResponse = {
                status: STATUS_CODES.SUCCESS,
                data: { subscriptions: mockSubscriptions, total: 2 },
                error: false,
                message: RESPONSE_MESSAGES.FETCH_DATA_SUCCESS
            };
            (subscriptionHelper.getRenewSubscriptions as jest.Mock).mockResolvedValue(mockResponse);

            await (subscriptionController as any).getRenewSubscriptions(req, res);

            expect(sendResponse).toHaveBeenCalledWith(res, mockResponse);
        });
    });
});
