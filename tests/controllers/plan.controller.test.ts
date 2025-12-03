import PlanController from '../../src/controllers/plan.controller';
import planHelpers from '../../src/controller-helpers/plan.helpers';
import sendResponse from '../../src/responses/response.helper';
import { STATUS_CODES } from '../../src/constants/index';

// Mock dependencies
jest.mock('../../src/controller-helpers/plan.helpers', () => ({
    getAllPlans: jest.fn(),
    getAllNodeForPlan: jest.fn(),
    postForPlanId: jest.fn(),
    getPlanId: jest.fn(),
}));

jest.mock('../../src/responses/response.helper', () => jest.fn());

jest.mock('../../src/middleware/sessionCheck', () => ({
    sessionCheck: (req: any, res: any, next: any) => next(),
}));

describe('PlanController', () => {
    let planController: PlanController;
    let req: any;
    let res: any;

    beforeEach(() => {
        planController = new PlanController();
        req = {
            query: {},
            body: {},
            user: { wallet_address: 'wallet1' }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
        jest.clearAllMocks();
    });

    describe('getAllPlans', () => {
        it('should call planHelpers.getAllPlans with correct parameters', async () => {
            req.query.prov_address = 'provider1';
            const mockResponse = { status: STATUS_CODES.SUCCESS, data: [] };
            (planHelpers.getAllPlans as jest.Mock).mockResolvedValue(mockResponse);

            await (planController as any).getAllPlans(req, res);

            expect(planHelpers.getAllPlans).toHaveBeenCalledWith('provider1');
            expect(sendResponse).toHaveBeenCalledWith(res, mockResponse);
        });
    });

    describe('getAllNodeForPlan', () => {
        it('should call planHelpers.getAllNodeForPlan with correct parameters', async () => {
            req.query = { limit: '10', page: '1' };
            const mockResponse = { status: STATUS_CODES.SUCCESS, data: [] };
            (planHelpers.getAllNodeForPlan as jest.Mock).mockResolvedValue(mockResponse);

            await (planController as any).getAllNodeForPlan(req, res);

            expect(planHelpers.getAllNodeForPlan).toHaveBeenCalledWith('wallet1', 1, 10);
            expect(sendResponse).toHaveBeenCalledWith(res, mockResponse);
        });

        it('should use default limit and page if not provided', async () => {
            req.query = {};
            const mockResponse = { status: STATUS_CODES.SUCCESS, data: [] };
            (planHelpers.getAllNodeForPlan as jest.Mock).mockResolvedValue(mockResponse);

            await (planController as any).getAllNodeForPlan(req, res);

            expect(planHelpers.getAllNodeForPlan).toHaveBeenCalledWith('wallet1', 1, 10);
        });
    });

    describe('postForPlanId', () => {
        it('should call planHelpers.postForPlanId with correct parameters', async () => {
            req.body.txhash = 'hash1';
            const mockResponse = { status: STATUS_CODES.SUCCESS, data: {} };
            (planHelpers.postForPlanId as jest.Mock).mockResolvedValue(mockResponse);

            await (planController as any).postForPlanId(req, res);

            expect(planHelpers.postForPlanId).toHaveBeenCalledWith('wallet1', 'hash1');
            expect(sendResponse).toHaveBeenCalledWith(res, mockResponse);
        });
    });

    describe('getPlanId', () => {
        it('should call planHelpers.getPlanId with correct parameters', async () => {
            const mockResponse = { status: STATUS_CODES.SUCCESS, data: {} };
            (planHelpers.getPlanId as jest.Mock).mockResolvedValue(mockResponse);

            await (planController as any).getPlanId(req, res);

            expect(planHelpers.getPlanId).toHaveBeenCalledWith('wallet1');
            expect(sendResponse).toHaveBeenCalledWith(res, mockResponse);
        });
    });

    describe('getUserPurchasedPlans', () => {
        it('should call planHelpers.getPlanId with correct parameters', async () => {
            const mockResponse = { status: STATUS_CODES.SUCCESS, data: {} };
            (planHelpers.getPlanId as jest.Mock).mockResolvedValue(mockResponse);

            await (planController as any).getUserPurchasedPlans(req, res);

            expect(planHelpers.getPlanId).toHaveBeenCalledWith('wallet1');
            expect(sendResponse).toHaveBeenCalledWith(res, mockResponse);
        });
    });
});
