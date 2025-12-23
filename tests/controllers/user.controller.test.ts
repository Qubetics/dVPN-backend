import UserController from '../../src/controllers/user.controller';
import userHelpers from '../../src/controller-helpers/user.helpers';
import UserHelper from '../../src/controller-helpers/user.helpers';
import sendResponse from '../../src/responses/response.helper';
import { STATUS_CODES } from '../../src/constants/index';

// Mock dependencies
jest.mock('../../src/controller-helpers/user.helpers', () => ({
    connectWallet: jest.fn(),
    userLogout: jest.fn(),
    userRefresh: jest.fn(),
}));

jest.mock('../../src/responses/response.helper', () => jest.fn());

jest.mock('../../src/middleware/sessionCheck', () => ({
    sessionCheck: (req: any, res: any, next: any) => next(),
}));

jest.mock('../../src/validations/user.validation', () => (req: any, res: any, next: any) => next());

describe('UserController', () => {
    let userController: UserController;
    let req: any;
    let res: any;

    beforeEach(() => {
        userController = new UserController();
        req = {
            body: {},
            headers: {},
            user: { wallet_address: 'wallet1' }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
        jest.clearAllMocks();
    });

    describe('connectWallet', () => {
        it('should call UserHelper.connectWallet with correct parameters', async () => {
            req.body = {
                wallet_address: 'wallet1',
                pubKey: 'pubkey',
                signature: 'sig'
            };
            const mockResponse = { status: STATUS_CODES.SUCCESS, data: {} };
            (UserHelper.connectWallet as jest.Mock).mockResolvedValue(mockResponse);

            await (userController as any).connectWallet(req, res);

            expect(UserHelper.connectWallet).toHaveBeenCalledWith('wallet1', 'pubkey', 'sig');
            expect(sendResponse).toHaveBeenCalledWith(res, mockResponse);
        });
    });

    describe('userLogout', () => {
        it('should call userHelpers.userLogout with correct parameters', async () => {
            req.headers['refresh_token'] = 'token';
            const mockResponse = { status: STATUS_CODES.SUCCESS, data: {} };
            (userHelpers.userLogout as jest.Mock).mockResolvedValue(mockResponse);

            await (userController as any).userLogout(req, res);

            expect(userHelpers.userLogout).toHaveBeenCalledWith('token');
            expect(sendResponse).toHaveBeenCalledWith(res, mockResponse);
        });
    });

    describe('userRefresh', () => {
        it('should call userHelpers.userRefresh with correct parameters', async () => {
            req.headers['refresh_token'] = 'token';
            const mockResponse = { status: STATUS_CODES.SUCCESS, data: {} };
            (userHelpers.userRefresh as jest.Mock).mockResolvedValue(mockResponse);

            await (userController as any).userRefresh(req, res);

            expect(userHelpers.userRefresh).toHaveBeenCalledWith('token');
            expect(sendResponse).toHaveBeenCalledWith(res, mockResponse);
        });
    });
});
