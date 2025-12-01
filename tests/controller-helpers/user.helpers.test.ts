import UserHelper from '../../src/controller-helpers/user.helpers';
import postgresDataHelper from '../../src/helpers/postgres.data.helper';
import redisHelper from '../../src/helpers/redis.helper';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../src/utils/jwt.utils';
import { verifyKeplrSignature } from '../../src/controller-helpers/common.helpers';
import { RESPONSE_MESSAGES, STATUS_CODES } from '../../src/constants/index';
import { v4 as uuidv4 } from 'uuid';

// Mock dependencies
jest.mock('../../src/helpers/postgres.data.helper', () => ({
    findOneData: jest.fn(),
    saveData: jest.fn(),
}));

jest.mock('../../src/helpers/redis.helper', () => ({
    client: {
        set: jest.fn(),
        get: jest.fn(),
    },
    removeFromRedis: jest.fn(),
}));

jest.mock('../../src/utils/jwt.utils', () => ({
    generateAccessToken: jest.fn(),
    generateRefreshToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
}));

jest.mock('../../src/controller-helpers/common.helpers', () => ({
    verifyKeplrSignature: jest.fn(),
}));

jest.mock('uuid', () => ({
    v4: jest.fn().mockReturnValue('mock-uuid'),
}));

// Mock connection
jest.mock('../../src/connection', () => ({
    sequelize: {
        fn: jest.fn(),
        col: jest.fn(),
        define: jest.fn().mockReturnValue({
            hasMany: jest.fn(),
            belongsTo: jest.fn(),
            sync: jest.fn().mockResolvedValue(true),
        }),
    }
}));

describe('UserHelper', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('connectWallet', () => {
        it('should return error if signature is invalid', async () => {
            (verifyKeplrSignature as jest.Mock).mockReturnValue({ verify: false });
            const result = await UserHelper.connectWallet('wallet1', 'pubkey', { signature: 'sig', pub_key: { type: 't', value: 'v' } });
            expect(result).toEqual({
                status: STATUS_CODES.BADREQUEST,
                message: RESPONSE_MESSAGES.INVALID_CREDENTIALS,
                error: true
            });
        });

        it('should create user if not exists and login', async () => {
            (verifyKeplrSignature as jest.Mock).mockReturnValue({ verify: true });
            (postgresDataHelper.findOneData as jest.Mock).mockResolvedValue(null);
            (postgresDataHelper.saveData as jest.Mock).mockResolvedValue({});
            (generateAccessToken as unknown as jest.Mock).mockReturnValue('access_token');
            (generateRefreshToken as unknown as jest.Mock).mockReturnValue('refresh_token');

            const result = await UserHelper.connectWallet('wallet1', 'pubkey', { signature: 'sig', pub_key: { type: 't', value: 'v' } });

            expect(postgresDataHelper.saveData).toHaveBeenCalled();
            expect(result).toEqual({
                data: {
                    accessToken: 'access_token',
                    refreshToken: 'refresh_token',
                },
                status: 200,
                message: RESPONSE_MESSAGES.LOGIN,
                error: false
            });
        });

        it('should login existing user', async () => {
            (verifyKeplrSignature as jest.Mock).mockReturnValue({ verify: true });
            (postgresDataHelper.findOneData as jest.Mock).mockResolvedValue({ id: 'user1' });
            (generateAccessToken as unknown as jest.Mock).mockReturnValue('access_token');
            (generateRefreshToken as unknown as jest.Mock).mockReturnValue('refresh_token');

            const result = await UserHelper.connectWallet('wallet1', 'pubkey', { signature: 'sig', pub_key: { type: 't', value: 'v' } });

            expect(postgresDataHelper.saveData).not.toHaveBeenCalled();
            expect(result).toEqual({
                data: {
                    accessToken: 'access_token',
                    refreshToken: 'refresh_token',
                },
                status: 200,
                message: RESPONSE_MESSAGES.LOGIN,
                error: false
            });
        });
    });

    describe('userLogout', () => {
        it('should return error if refresh_token is missing', async () => {
            const result = await UserHelper.userLogout('');
            expect(result).toEqual({
                status: STATUS_CODES.BADREQUEST,
                message: RESPONSE_MESSAGES.BADREQUEST,
                error: true
            });
        });

        it('should return error if session not found in redis', async () => {
            (verifyRefreshToken as jest.Mock).mockReturnValue({ refresh_uuid: 'uuid' });
            (redisHelper.client.get as jest.Mock).mockResolvedValue(null);

            const result = await UserHelper.userLogout('token');
            expect(result).toEqual({
                status: STATUS_CODES.UNAUTHORIZED,
                message: RESPONSE_MESSAGES.UNAUTHORIZED,
                error: true
            });
        });

        it('should logout user', async () => {
            (verifyRefreshToken as jest.Mock).mockReturnValue({ refresh_uuid: 'uuid' });
            (redisHelper.client.get as jest.Mock).mockResolvedValue(JSON.stringify({ access_token_uuid: 'access_uuid' }));

            const result = await UserHelper.userLogout('token');

            expect(redisHelper.removeFromRedis).toHaveBeenCalledTimes(2);
            expect(result).toEqual({
                message: RESPONSE_MESSAGES.LOGOUT,
                status: STATUS_CODES.SUCCESS,
                error: false
            });
        });
    });

    describe('userRefresh', () => {
        it('should return error if refresh_token is missing', async () => {
            const result = await UserHelper.userRefresh('');
            expect(result).toEqual({
                status: STATUS_CODES.BADREQUEST,
                message: RESPONSE_MESSAGES.BADREQUEST,
                error: true
            });
        });

        it('should return error if token invalid', async () => {
            (verifyRefreshToken as jest.Mock).mockReturnValue(null);
            const result = await UserHelper.userRefresh('token');
            expect(result).toEqual({
                status: STATUS_CODES.UNAUTHORIZED,
                message: RESPONSE_MESSAGES.INVALID_TOKEN,
                error: true
            });
        });

        it('should return error if session not found in redis', async () => {
            (verifyRefreshToken as jest.Mock).mockReturnValue({ refresh_uuid: 'uuid', wallet_address: 'wallet1' });
            (redisHelper.client.get as jest.Mock).mockResolvedValue(null);

            const result = await UserHelper.userRefresh('token');
            expect(result).toEqual({
                status: STATUS_CODES.UNAUTHORIZED,
                message: RESPONSE_MESSAGES.UNAUTHORIZED,
                error: true
            });
        });

        it('should refresh tokens', async () => {
            (verifyRefreshToken as jest.Mock).mockReturnValue({ refresh_uuid: 'uuid', wallet_address: 'wallet1' });
            (redisHelper.client.get as jest.Mock).mockResolvedValue('some value');
            (generateAccessToken as unknown as jest.Mock).mockReturnValue('new_access');
            (generateRefreshToken as unknown as jest.Mock).mockReturnValue('new_refresh');

            const result = await UserHelper.userRefresh('token');

            expect(redisHelper.client.set).toHaveBeenCalledTimes(2);
            expect(result).toEqual({
                data: {
                    accessToken: 'new_access',
                    refreshToken: 'new_refresh',
                },
                status: 200,
                message: RESPONSE_MESSAGES.SUCCESS_NEW_TOKEN,
                error: false
            });
        });
    });
});
