import ProviderHelper from '../../src/controller-helpers/provider.helper';
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

describe('ProviderHelper', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getProviderList', () => {
        it('should return error if walletAddress is missing', async () => {
            const result = await ProviderHelper.getProviderList('', false);
            expect(result).toEqual({
                status: STATUS_CODES.UNAUTHORIZED,
                message: RESPONSE_MESSAGES.UNAUTHORIZED,
                error: true
            });
        });

        it('should return provider list', async () => {
            const mockProviders = [{
                name: 'p1',
                address: 'addr1',
                identity: 'id1',
                website: 'web1',
                plans: [{
                    plan_id: 'plan1',
                    subscriptions: [{ wallet_address: 'wallet1' }],
                    nodes: [{ country: 'US' }]
                }]
            }];
            (postgresDataHelper.findDataFromJoinModels as jest.Mock).mockResolvedValue(mockProviders);

            const result = await ProviderHelper.getProviderList('wallet1', false);
            expect(result).toEqual({
                status: STATUS_CODES.SUCCESS,
                message: RESPONSE_MESSAGES.PROVIDER_LIST_FETCH_SUCESSFULLY,
                data: [{
                    name: 'p1',
                    address: 'addr1',
                    identity: 'id1',
                    website: 'web1',
                    isUserSubscribed: true,
                    subscribedPlanIds: ['plan1'],
                    countryCount: 1
                }],
                error: false
            });
        });

        it('should return filtered provider list if subscribed is true', async () => {
            const mockProviders = [{
                name: 'p1',
                plans: [{
                    plan_id: 'plan1',
                    subscriptions: [], // Not subscribed
                    nodes: []
                }]
            }];
            (postgresDataHelper.findDataFromJoinModels as jest.Mock).mockResolvedValue(mockProviders);

            const result = await ProviderHelper.getProviderList('wallet1', true);
            expect(result).toEqual({
                status: STATUS_CODES.SUCCESS,
                message: RESPONSE_MESSAGES.PROVIDER_LIST_FETCH_SUCESSFULLY,
                data: [],
                error: false
            });
        });

        it('should handle providers with no plans or nodes', async () => {
            const mockProviders = [{
                name: 'p1',
                plans: null // No plans
            }];
            (postgresDataHelper.findDataFromJoinModels as jest.Mock).mockResolvedValue(mockProviders);

            const result = await ProviderHelper.getProviderList('wallet1', false);
            expect(result).toEqual({
                status: STATUS_CODES.SUCCESS,
                message: RESPONSE_MESSAGES.PROVIDER_LIST_FETCH_SUCESSFULLY,
                data: [{
                    name: 'p1',
                    isUserSubscribed: false,
                    countryCount: 0
                }],
                error: false
            });
        });

        it('should return error if exception occurs', async () => {
            (postgresDataHelper.findDataFromJoinModels as jest.Mock).mockRejectedValue(new Error('DB Error'));

            const result = await ProviderHelper.getProviderList('wallet1', false);

            expect(result).toEqual({
                status: STATUS_CODES.INTERNALSERVER,
                message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
                error: true
            });
        });
    });

    describe('getRecentProviderList', () => {
        it('should return error if walletAddress is missing', async () => {
            const result = await ProviderHelper.getRecentProviderList('');
            expect(result).toEqual({
                status: STATUS_CODES.UNAUTHORIZED,
                message: RESPONSE_MESSAGES.UNAUTHORIZED,
                error: true
            });
        });

        it('should handle case where no recent session found', async () => {
            (postgresDataHelper.findDataFromJoinModels as jest.Mock)
                .mockResolvedValueOnce([]) // No recent session
                .mockResolvedValueOnce([{
                    name: 'p1',
                    address: undefined,
                    identity: undefined,
                    website: undefined,
                    plans: []
                }]);

            const result = await ProviderHelper.getRecentProviderList('wallet1');
            expect(result).toEqual({
                status: STATUS_CODES.SUCCESS,
                message: RESPONSE_MESSAGES.PROVIDER_LIST_FETCH_SUCESSFULLY,
                data: [{
                    name: 'p1',
                    address: undefined,
                    identity: undefined,
                    website: undefined,
                    countryCount: 0,
                    isUserSubscribed: false
                }],
                error: false
            });
        });

        it('should handle providers with undefined plans', async () => {
            (postgresDataHelper.findDataFromJoinModels as jest.Mock)
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([{
                    name: 'p1',
                    plans: undefined
                }]);

            const result = await ProviderHelper.getRecentProviderList('wallet1');
            expect(result.data[0].isUserSubscribed).toBe(false);
        });

        it('should return error if exception occurs', async () => {
            (postgresDataHelper.findDataFromJoinModels as jest.Mock).mockRejectedValue(new Error('DB Error'));

            const result = await ProviderHelper.getRecentProviderList('wallet1');

            expect(result).toEqual({
                status: STATUS_CODES.INTERNALSERVER,
                message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
                error: true
            });
        });

        it('should return recent provider list', async () => {
            // Mock latest session
            (postgresDataHelper.findDataFromJoinModels as jest.Mock)
                .mockResolvedValueOnce([{ nodes: { plans: { provider_address: 'addr1' } } }]) // First call for latest session
                .mockResolvedValueOnce([{ // Second call for providers
                    name: 'p1',
                    address: 'addr1',
                    identity: 'id1',
                    website: 'web1',
                    plans: [{
                        plan_id: 'plan1',
                        subscriptions: [{ wallet_address: 'wallet1' }],
                        nodes: []
                    }]
                }]);

            const result = await ProviderHelper.getRecentProviderList('wallet1');
            expect(result).toEqual({
                status: STATUS_CODES.SUCCESS,
                message: RESPONSE_MESSAGES.PROVIDER_LIST_FETCH_SUCESSFULLY,
                data: [{
                    name: 'p1',
                    address: 'addr1',
                    identity: 'id1',
                    website: 'web1',
                    countryCount: 0,
                    isUserSubscribed: true,
                    subscribedPlanIds: ['plan1']
                }],
                error: false
            });
        });
    });
});
