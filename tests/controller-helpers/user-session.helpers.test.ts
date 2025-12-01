import UserSessionHelper from '../../src/controller-helpers/user-session.helpers';
import postgresDataHelper from '../../src/helpers/postgres.data.helper';
import { RESPONSE_MESSAGES, STATUS_CODES } from '../../src/constants/index';

// Mock postgresDataHelper
jest.mock('../../src/helpers/postgres.data.helper', () => ({
    findDataFromJoinModels: jest.fn(),
}));

// Mock connection
jest.mock('../../src/connection', () => ({
    sequelize: {
        fn: jest.fn(),
        col: jest.fn(),
        literal: jest.fn(),
        define: jest.fn().mockReturnValue({
            hasMany: jest.fn(),
            belongsTo: jest.fn(),
            sync: jest.fn().mockResolvedValue(true),
        }),
    }
}));

describe('UserSessionHelper', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('UserSessionList', () => {
        it('should return error if wallet_address is missing', async () => {
            const result = await UserSessionHelper.UserSessionList('');
            expect(result).toEqual({
                status: STATUS_CODES.UNAUTHORIZED,
                message: RESPONSE_MESSAGES.UNAUTHORIZED,
                error: true
            });
        });

        it('should return session list', async () => {
            const mockSessions = [{ id: 1, acc_address: 'wallet1' }];
            (postgresDataHelper.findDataFromJoinModels as jest.Mock).mockResolvedValue(mockSessions);

            const result = await UserSessionHelper.UserSessionList('wallet1');
            expect(result).toEqual({
                data: {
                    sessions: mockSessions,
                    total: 1
                },
                status: STATUS_CODES.SUCCESS,
                message: RESPONSE_MESSAGES.FETCH_DATA_SUCCESS,
                error: false
            });
        });

        it('should return empty list if no sessions found', async () => {
            (postgresDataHelper.findDataFromJoinModels as jest.Mock).mockResolvedValue([]);

            const result = await UserSessionHelper.UserSessionList('wallet1');
            expect(result).toEqual({
                data: {
                    sessions: [],
                    total: 0
                },
                status: STATUS_CODES.SUCCESS,
                message: RESPONSE_MESSAGES.FETCH_DATA_SUCCESS,
                error: false
            });
        });
    });

    describe('UserServerList', () => {
        it('should return server list', async () => {
            const mockServers = [{ address: 'node1', city: 'City1', country: 'Country1' }];
            (postgresDataHelper.findDataFromJoinModels as jest.Mock).mockResolvedValue(mockServers);

            const result = await UserSessionHelper.UserServerList('wallet1', 10, 1, true);
            expect(result).toEqual({
                data: {
                    nodes: mockServers,
                    total: 1
                },
                status: STATUS_CODES.SUCCESS,
                message: RESPONSE_MESSAGES.FETCH_DATA_SUCCESS,
                error: false
            });
        });

        it('should return server list without total if countTotal is false', async () => {
            const mockServers = [{ address: 'node1' }];
            (postgresDataHelper.findDataFromJoinModels as jest.Mock).mockResolvedValue(mockServers);

            const result = await UserSessionHelper.UserServerList('wallet1', 10, 1, false);
            expect(result).toEqual({
                data: {
                    nodes: mockServers
                },
                status: STATUS_CODES.SUCCESS,
                message: RESPONSE_MESSAGES.FETCH_DATA_SUCCESS,
                error: false
            });
        });
    });
});
