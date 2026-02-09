import UserSessionController from '../../src/controllers/user-session.controller';
import UserSessionHelper from '../../src/controller-helpers/user-session.helpers';
import sendResponse from '../../src/responses/response.helper';
import { STATUS_CODES } from '../../src/constants/index';

// Mock dependencies
jest.mock('../../src/controller-helpers/user-session.helpers', () => ({
    UserSessionList: jest.fn(),
    UserServerList: jest.fn(),
}));

jest.mock('../../src/responses/response.helper', () => jest.fn());

jest.mock('../../src/middleware/sessionCheck', () => ({
    sessionCheck: (req: any, res: any, next: any) => next(),
}));

describe('UserSessionController', () => {
    let userSessionController: UserSessionController;
    let req: any;
    let res: any;

    beforeEach(() => {
        userSessionController = new UserSessionController();
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

    describe('getSessionsList', () => {
        it('should call UserSessionHelper.UserSessionList with correct parameters', async () => {
            req.query = { limit: '10', page: '1', order: 'ASC' };
            const mockResponse = { status: STATUS_CODES.SUCCESS, data: [] };
            (UserSessionHelper.UserSessionList as jest.Mock).mockResolvedValue(mockResponse);

            await (userSessionController as any).getSessionsList(req, res);

            expect(UserSessionHelper.UserSessionList).toHaveBeenCalledWith('wallet1', 10, 1, 'ASC');
            expect(sendResponse).toHaveBeenCalledWith(res, mockResponse);
        });
    });

    describe('UserServerList', () => {
        it('should call UserSessionHelper.UserServerList with correct parameters', async () => {
            req.query = { limit: '10', page: '1', count_total: 'true', order: 'ASC' };
            const mockResponse = { status: STATUS_CODES.SUCCESS, data: [] };
            (UserSessionHelper.UserServerList as jest.Mock).mockResolvedValue(mockResponse);

            await (userSessionController as any).UserServerList(req, res);

            expect(UserSessionHelper.UserServerList).toHaveBeenCalledWith('wallet1', 10, 1, true, 'ASC');
            expect(sendResponse).toHaveBeenCalledWith(res, mockResponse);
        });
    });
});
