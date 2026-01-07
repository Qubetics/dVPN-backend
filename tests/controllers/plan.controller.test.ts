import PlanController from '../../src/controllers/plan.controller';
import planHelpers from '../../src/controller-helpers/plan.helpers';
import sendResponse from '../../src/responses/response.helper';
import { STATUS_CODES } from '../../src/constants/index';

// Mock dependencies
jest.mock('../../src/controller-helpers/plan.helpers', () => ({
    getAllPlans: jest.fn(),
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
});
