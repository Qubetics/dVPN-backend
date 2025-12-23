import { sessionCheck } from '../../src/middleware/sessionCheck';
import redisHelper from '../../src/helpers/redis.helper';
import postgresDataHelper from '../../src/helpers/postgres.data.helper';
import { verifyAccessToken, decodeToken } from '../../src/utils/jwt.utils';

jest.mock('../../src/helpers/postgres.data.helper', () => ({
    findOneData: jest.fn()
}));

jest.mock('../../src/utils/jwt.utils', () => ({
    verifyAccessToken: jest.fn(),
    decodeToken: jest.fn()
}));

jest.mock('../../src/helpers/redis.helper', () => ({
    client: {
        get: jest.fn()
    }
}));

jest.mock('../../src/responses/response.helper', () => jest.fn());

describe('sessionCheck Middleware', () => {
    let req: any;
    let res: any;
    let next: jest.Mock;

    beforeEach(() => {
        req = {
            headers: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    it('should return unauthorized if no authorization header', async () => {
        await sessionCheck(req, res, next);

        expect(next).not.toHaveBeenCalled();
    });

    it('should return unauthorized if authorization header does not start with Bearer', async () => {
        req.headers.authorization = 'InvalidToken';

        await sessionCheck(req, res, next);

        expect(next).not.toHaveBeenCalled();
    });

    it('should return invalid token if token cannot be decoded', async () => {
        req.headers.authorization = 'Bearer invalid-token';
        (decodeToken as jest.Mock).mockReturnValue(null);

        await sessionCheck(req, res, next);

        expect(next).not.toHaveBeenCalled();
    });

    it('should return invalid token if token verification fails', async () => {
        req.headers.authorization = 'Bearer valid-token';
        (decodeToken as jest.Mock).mockReturnValue({ wallet_address: 'wallet1' });
        (verifyAccessToken as jest.Mock).mockReturnValue(null);

        await sessionCheck(req, res, next);

        expect(next).not.toHaveBeenCalled();
    });

    it('should return invalid token if access_uuid is missing', async () => {
        req.headers.authorization = 'Bearer valid-token';
        (decodeToken as jest.Mock).mockReturnValue({ wallet_address: 'wallet1' });
        (verifyAccessToken as jest.Mock).mockReturnValue({ wallet_address: 'wallet1' });

        await sessionCheck(req, res, next);

        expect(next).not.toHaveBeenCalled();
    });

    it('should return invalid token if session not found in redis', async () => {
        req.headers.authorization = 'Bearer valid-token';
        (decodeToken as jest.Mock).mockReturnValue({ wallet_address: 'wallet1', access_uuid: 'uuid1' });
        (verifyAccessToken as jest.Mock).mockReturnValue({ wallet_address: 'wallet1', access_uuid: 'uuid1' });
        (redisHelper.client.get as jest.Mock).mockResolvedValue(null);

        await sessionCheck(req, res, next);

        expect(next).not.toHaveBeenCalled();
    });

    it('should return user not found if user does not exist in database', async () => {
        req.headers.authorization = 'Bearer valid-token';
        (decodeToken as jest.Mock).mockReturnValue({ wallet_address: 'wallet1', access_uuid: 'uuid1' });
        (verifyAccessToken as jest.Mock).mockReturnValue({ wallet_address: 'wallet1', access_uuid: 'uuid1' });
        (redisHelper.client.get as jest.Mock).mockResolvedValue(JSON.stringify({ refresh_uuid: 'refresh1' }));
        (postgresDataHelper.findOneData as jest.Mock).mockResolvedValue(null);

        await sessionCheck(req, res, next);

        expect(next).not.toHaveBeenCalled();
    });

    it('should call next and attach user to request if all checks pass', async () => {
        req.headers.authorization = 'Bearer valid-token';
        (decodeToken as jest.Mock).mockReturnValue({ wallet_address: 'wallet1', access_uuid: 'uuid1' });
        (verifyAccessToken as jest.Mock).mockReturnValue({ wallet_address: 'wallet1', access_uuid: 'uuid1' });
        (redisHelper.client.get as jest.Mock).mockResolvedValue(JSON.stringify({ refresh_uuid: 'refresh1' }));
        (postgresDataHelper.findOneData as jest.Mock).mockResolvedValue({ wallet_address: 'wallet1' });

        await sessionCheck(req, res, next);

        expect(req.user).toEqual({
            wallet_address: 'wallet1',
            access_uuid: 'uuid1',
            refresh_uuid: 'refresh1'
        });
        expect(next).toHaveBeenCalled();
    });
});
