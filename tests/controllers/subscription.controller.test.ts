import SubscriptionController from '../../src/controllers/subscription.controller';
import subscriptionHelper from '../../src/controller-helpers/subscription.helper';
import sendResponse from '../../src/responses/response.helper';
import { STATUS_CODES } from '../../src/constants/index';

// Mock dependencies
jest.mock('../../src/controller-helpers/subscription.helper', () => ({
    getSubscritptionsList: jest.fn(),
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

    describe('getSubscritptionsList', () => {
        it('should call subscriptionHelper.getSubscritptionsList with correct parameters', async () => {
            req.query = { limit: '10', page: '1', order: 'ASC' };
            const mockResponse = { status: STATUS_CODES.SUCCESS, data: [] };
            (subscriptionHelper.getSubscritptionsList as jest.Mock).mockResolvedValue(mockResponse);

            await (subscriptionController as any).getSubscritptionsList(req, res);

            expect(subscriptionHelper.getSubscritptionsList).toHaveBeenCalledWith('wallet1', 10, 1, 'ASC');
            expect(sendResponse).toHaveBeenCalledWith(res, mockResponse);
        });
    });
});
