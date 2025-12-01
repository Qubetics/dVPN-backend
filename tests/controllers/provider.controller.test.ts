import ProviderController from '../../src/controllers/provider.controller';
import providerHelper from '../../src/controller-helpers/provider.helper';
import sendResponse from '../../src/responses/response.helper';
import { STATUS_CODES } from '../../src/constants/index';

// Mock dependencies
jest.mock('../../src/controller-helpers/provider.helper', () => ({
    getProviderList: jest.fn(),
    getRecentProviderList: jest.fn(),
}));

jest.mock('../../src/responses/response.helper', () => jest.fn());

jest.mock('../../src/middleware/sessionCheck', () => ({
    sessionCheck: (req: any, res: any, next: any) => next(),
}));

describe('ProviderController', () => {
    let providerController: ProviderController;
    let req: any;
    let res: any;

    beforeEach(() => {
        providerController = new ProviderController();
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

    describe('getProviderList', () => {
        it('should call providerHelper.getProviderList with correct parameters', async () => {
            req.query.isUserSubscribed = 'true';
            const mockResponse = { status: STATUS_CODES.SUCCESS, data: [] };
            (providerHelper.getProviderList as jest.Mock).mockResolvedValue(mockResponse);

            await (providerController as any).getProviderList(req, res);

            expect(providerHelper.getProviderList).toHaveBeenCalledWith('wallet1', true);
            expect(sendResponse).toHaveBeenCalledWith(res, mockResponse);
        });

        it('should handle isUserSubscribed as "1"', async () => {
            req.query.isUserSubscribed = '1';
            const mockResponse = { status: STATUS_CODES.SUCCESS, data: [] };
            (providerHelper.getProviderList as jest.Mock).mockResolvedValue(mockResponse);

            await (providerController as any).getProviderList(req, res);

            expect(providerHelper.getProviderList).toHaveBeenCalledWith('wallet1', true);
            expect(sendResponse).toHaveBeenCalledWith(res, mockResponse);
        });

        it('should handle isUserSubscribed as false', async () => {
            req.query.isUserSubscribed = 'false';
            const mockResponse = { status: STATUS_CODES.SUCCESS, data: [] };
            (providerHelper.getProviderList as jest.Mock).mockResolvedValue(mockResponse);

            await (providerController as any).getProviderList(req, res);

            expect(providerHelper.getProviderList).toHaveBeenCalledWith('wallet1', false);
            expect(sendResponse).toHaveBeenCalledWith(res, mockResponse);
        });
    });

    describe('getRecentProviderList', () => {
        it('should call providerHelper.getRecentProviderList with correct parameters', async () => {
            const mockResponse = { status: STATUS_CODES.SUCCESS, data: [] };
            (providerHelper.getRecentProviderList as jest.Mock).mockResolvedValue(mockResponse);

            await (providerController as any).getRecentProviderList(req, res);

            expect(providerHelper.getRecentProviderList).toHaveBeenCalledWith('wallet1');
            expect(sendResponse).toHaveBeenCalledWith(res, mockResponse);
        });
    });
});
