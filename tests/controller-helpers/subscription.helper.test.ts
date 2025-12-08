import SubscriptionHelper from '../../src/controller-helpers/subscription.helper';
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
        define: jest.fn().mockReturnValue({
            hasMany: jest.fn(),
            belongsTo: jest.fn(),
            sync: jest.fn().mockResolvedValue(true),
        }),
    }
}));

describe('SubscriptionHelper', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getSubscritptionsList', () => {
        it('should return error if wallet_address is missing', async () => {
            const result = await SubscriptionHelper.getSubscritptionsList('');
            expect(result).toEqual({
                status: STATUS_CODES.UNAUTHORIZED,
                message: RESPONSE_MESSAGES.UNAUTHORIZED,
                error: true
            });
        });

        it('should return error if wallet_address is "undefined" string', async () => {
            const result = await SubscriptionHelper.getSubscritptionsList('undefined');
            expect(result).toEqual({
                status: STATUS_CODES.UNAUTHORIZED,
                message: RESPONSE_MESSAGES.UNAUTHORIZED,
                error: true
            });
        });

        it('should return subscription list with default pagination', async () => {
            const mockSubscriptions = [{ id: 1, wallet_address: 'wallet1' }];
            (postgresDataHelper.findDataFromJoinModels as jest.Mock).mockResolvedValue(mockSubscriptions);

            const result = await SubscriptionHelper.getSubscritptionsList('wallet1');

            expect(postgresDataHelper.findDataFromJoinModels).toHaveBeenCalledWith(
                expect.any(String),
                { wallet_address: 'wallet1' },
                expect.any(Array),
                expect.any(Array),
                expect.objectContaining({
                    limit: 10,
                    offset: 0,
                    order: [['createdAt', 'DESC']],
                    raw: false
                })
            );

            expect(result).toEqual({
                data: {
                    subscriptions: mockSubscriptions,
                    total: 1
                },
                status: STATUS_CODES.SUCCESS,
                message: RESPONSE_MESSAGES.FETCH_DATA_SUCCESS,
                error: false
            });
        });

        it('should return subscription list with custom pagination', async () => {
            const mockSubscriptions = [{ id: 1, wallet_address: 'wallet1' }];
            (postgresDataHelper.findDataFromJoinModels as jest.Mock).mockResolvedValue(mockSubscriptions);

            const result = await SubscriptionHelper.getSubscritptionsList('wallet1', 20, 3);

            expect(postgresDataHelper.findDataFromJoinModels).toHaveBeenCalledWith(
                expect.any(String),
                { wallet_address: 'wallet1' },
                expect.any(Array),
                expect.any(Array),
                expect.objectContaining({
                    limit: 20,
                    offset: 40, // (3-1) * 20
                    order: [['createdAt', 'DESC']],
                    raw: false
                })
            );

            expect(result).toEqual({
                data: {
                    subscriptions: mockSubscriptions,
                    total: 1
                },
                status: STATUS_CODES.SUCCESS,
                message: RESPONSE_MESSAGES.FETCH_DATA_SUCCESS,
                error: false
            });
        });

        it('should return subscription list with ASC order', async () => {
            const mockSubscriptions = [{ id: 1, wallet_address: 'wallet1' }];
            (postgresDataHelper.findDataFromJoinModels as jest.Mock).mockResolvedValue(mockSubscriptions);

            const result = await SubscriptionHelper.getSubscritptionsList('wallet1', 10, 1, 'ASC');

            expect(postgresDataHelper.findDataFromJoinModels).toHaveBeenCalledWith(
                expect.any(String),
                { wallet_address: 'wallet1' },
                expect.any(Array),
                expect.any(Array),
                expect.objectContaining({
                    order: [['createdAt', 'ASC']],
                })
            );

            expect(result.status).toBe(STATUS_CODES.SUCCESS);
        });

        it('should return subscription list with DESC order by default', async () => {
            const mockSubscriptions = [{ id: 1, wallet_address: 'wallet1' }];
            (postgresDataHelper.findDataFromJoinModels as jest.Mock).mockResolvedValue(mockSubscriptions);

            const result = await SubscriptionHelper.getSubscritptionsList('wallet1', 10, 1, 'INVALID');

            expect(postgresDataHelper.findDataFromJoinModels).toHaveBeenCalledWith(
                expect.any(String),
                { wallet_address: 'wallet1' },
                expect.any(Array),
                expect.any(Array),
                expect.objectContaining({
                    order: [['createdAt', 'DESC']],
                })
            );

            expect(result.status).toBe(STATUS_CODES.SUCCESS);
        });

        it('should return empty list if no subscriptions found', async () => {
            (postgresDataHelper.findDataFromJoinModels as jest.Mock).mockResolvedValue([]);

            const result = await SubscriptionHelper.getSubscritptionsList('wallet1');
            expect(result).toEqual({
                data: {
                    subscriptions: [],
                    total: 0
                },
                status: STATUS_CODES.SUCCESS,
                message: RESPONSE_MESSAGES.FETCH_DATA_SUCCESS,
                error: false
            });
        });

        it('should return empty list if null is returned', async () => {
            (postgresDataHelper.findDataFromJoinModels as jest.Mock).mockResolvedValue(null);

            const result = await SubscriptionHelper.getSubscritptionsList('wallet1');
            expect(result).toEqual({
                data: {
                    subscriptions: [],
                    total: 0
                },
                status: STATUS_CODES.SUCCESS,
                message: RESPONSE_MESSAGES.FETCH_DATA_SUCCESS,
                error: false
            });
        });

        it('should return error if database exception occurs', async () => {
            (postgresDataHelper.findDataFromJoinModels as jest.Mock).mockRejectedValue(new Error('DB Error'));

            const result = await SubscriptionHelper.getSubscritptionsList('wallet1');

            expect(result).toEqual({
                status: STATUS_CODES.INTERNALSERVER,
                message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
                error: true
            });
        });
    });

    describe('getRenewSubscriptions', () => {
        it('should return error if wallet_address is missing', async () => {
            const result = await SubscriptionHelper.getRenewSubscriptions('');
            expect(result).toEqual({
                status: STATUS_CODES.UNAUTHORIZED,
                message: RESPONSE_MESSAGES.UNAUTHORIZED,
                error: true
            });
        });

        it('should return error if wallet_address is "undefined" string', async () => {
            const result = await SubscriptionHelper.getRenewSubscriptions('undefined');
            expect(result).toEqual({
                status: STATUS_CODES.UNAUTHORIZED,
                message: RESPONSE_MESSAGES.UNAUTHORIZED,
                error: true
            });
        });

        it('should return empty renew subscriptions list when no subscriptions exist', async () => {
            (postgresDataHelper.findDataFromJoinModels as jest.Mock).mockResolvedValue([]);

            const result = await SubscriptionHelper.getRenewSubscriptions('wallet1');

            expect(result).toEqual({
                data: {
                    subscriptions: [],
                    total: 0
                },
                status: STATUS_CODES.SUCCESS,
                message: RESPONSE_MESSAGES.FETCH_DATA_SUCCESS,
                error: false
            });
        });

        it('should not mark subscriptions as renewable when active subscription exists for provider', async () => {
            const futureDate = new Date(Date.now() + 86400000).toISOString(); // +1 day
            const mockSubscriptions = [
                {
                    id: 1,
                    wallet_address: 'wallet1',
                    plan_id: 'plan1',
                    inactive_at: futureDate,
                    plans: {
                        provider_address: 'provider1',
                        providers: { name: 'Provider 1' }
                    },
                    toJSON: function () { return { ...this }; }
                }
            ];
            (postgresDataHelper.findDataFromJoinModels as jest.Mock).mockResolvedValue(mockSubscriptions);

            const result = await SubscriptionHelper.getRenewSubscriptions('wallet1');

            expect(result).toEqual({
                data: {
                    subscriptions: [],
                    total: 0
                },
                status: STATUS_CODES.SUCCESS,
                message: RESPONSE_MESSAGES.FETCH_DATA_SUCCESS,
                error: false
            });
        });

        it('should mark latest expired subscription as renewable when no active subscription exists', async () => {
            const pastDate1 = new Date(Date.now() - 86400000).toISOString(); // -1 day
            const pastDate2 = new Date(Date.now() - 172800000).toISOString(); // -2 days
            const mockSubscriptions = [
                {
                    id: 1,
                    wallet_address: 'wallet1',
                    plan_id: 'plan1',
                    inactive_at: pastDate1,
                    plans: {
                        provider_address: 'provider1',
                        providers: { name: 'Provider 1' }
                    },
                    toJSON: function () { return { ...this }; }
                },
                {
                    id: 2,
                    wallet_address: 'wallet1',
                    plan_id: 'plan1',
                    inactive_at: pastDate2,
                    plans: {
                        provider_address: 'provider1',
                        providers: { name: 'Provider 1' }
                    },
                    toJSON: function () { return { ...this }; }
                }
            ];
            (postgresDataHelper.findDataFromJoinModels as jest.Mock).mockResolvedValue(mockSubscriptions);

            const result = await SubscriptionHelper.getRenewSubscriptions('wallet1');

            expect(result.data.subscriptions).toHaveLength(1);
            expect(result.data.subscriptions[0].id).toBe(1); // Latest expired
            expect(result.data.total).toBe(1);
            expect(result.status).toBe(STATUS_CODES.SUCCESS);
        });

        it('should handle multiple providers with different renewal statuses', async () => {
            const futureDate = new Date(Date.now() + 86400000).toISOString();
            const pastDate = new Date(Date.now() - 86400000).toISOString();
            const mockSubscriptions = [
                {
                    id: 1,
                    wallet_address: 'wallet1',
                    plan_id: 'plan1',
                    inactive_at: futureDate,
                    plans: {
                        provider_address: 'provider1',
                        providers: { name: 'Provider 1' }
                    },
                    toJSON: function () { return { ...this }; }
                },
                {
                    id: 2,
                    wallet_address: 'wallet1',
                    plan_id: 'plan2',
                    inactive_at: pastDate,
                    plans: {
                        provider_address: 'provider2',
                        providers: { name: 'Provider 2' }
                    },
                    toJSON: function () { return { ...this }; }
                }
            ];
            (postgresDataHelper.findDataFromJoinModels as jest.Mock).mockResolvedValue(mockSubscriptions);

            const result = await SubscriptionHelper.getRenewSubscriptions('wallet1');

            expect(result.data.subscriptions).toHaveLength(1);
            expect(result.data.subscriptions[0].id).toBe(2); // Only provider2's expired sub
            expect(result.status).toBe(STATUS_CODES.SUCCESS);
        });

        it('should handle multiple plans per provider and mark latest expired per plan', async () => {
            const pastDate1 = new Date(Date.now() - 86400000).toISOString();
            const pastDate2 = new Date(Date.now() - 172800000).toISOString();
            const pastDate3 = new Date(Date.now() - 259200000).toISOString();
            const mockSubscriptions = [
                {
                    id: 1,
                    wallet_address: 'wallet1',
                    plan_id: 'plan1',
                    inactive_at: pastDate1,
                    plans: {
                        provider_address: 'provider1',
                        providers: { name: 'Provider 1' }
                    },
                    toJSON: function () { return { ...this }; }
                },
                {
                    id: 2,
                    wallet_address: 'wallet1',
                    plan_id: 'plan1',
                    inactive_at: pastDate2,
                    plans: {
                        provider_address: 'provider1',
                        providers: { name: 'Provider 1' }
                    },
                    toJSON: function () { return { ...this }; }
                },
                {
                    id: 3,
                    wallet_address: 'wallet1',
                    plan_id: 'plan2',
                    inactive_at: pastDate3,
                    plans: {
                        provider_address: 'provider1',
                        providers: { name: 'Provider 1' }
                    },
                    toJSON: function () { return { ...this }; }
                }
            ];
            (postgresDataHelper.findDataFromJoinModels as jest.Mock).mockResolvedValue(mockSubscriptions);

            const result = await SubscriptionHelper.getRenewSubscriptions('wallet1');

            expect(result.data.subscriptions).toHaveLength(2);
            expect(result.data.subscriptions.map((s: any) => s.id).sort()).toEqual([1, 3]);
            expect(result.status).toBe(STATUS_CODES.SUCCESS);
        });

        it('should use custom pagination parameters', async () => {
            (postgresDataHelper.findDataFromJoinModels as jest.Mock).mockResolvedValue([]);

            await SubscriptionHelper.getRenewSubscriptions('wallet1', 25, 2);

            expect(postgresDataHelper.findDataFromJoinModels).toHaveBeenCalledWith(
                expect.any(String),
                { wallet_address: 'wallet1' },
                expect.any(Array),
                expect.any(Array),
                expect.objectContaining({
                    limit: 25,
                    offset: 25, // (2-1) * 25
                    order: [['createdAt', 'DESC']],
                    raw: false
                })
            );
        });

        it('should use ASC order when specified', async () => {
            (postgresDataHelper.findDataFromJoinModels as jest.Mock).mockResolvedValue([]);

            await SubscriptionHelper.getRenewSubscriptions('wallet1', 10, 1, 'ASC');

            expect(postgresDataHelper.findDataFromJoinModels).toHaveBeenCalledWith(
                expect.any(String),
                { wallet_address: 'wallet1' },
                expect.any(Array),
                expect.any(Array),
                expect.objectContaining({
                    order: [['createdAt', 'ASC']],
                })
            );
        });

        it('should use DESC order by default', async () => {
            (postgresDataHelper.findDataFromJoinModels as jest.Mock).mockResolvedValue([]);

            await SubscriptionHelper.getRenewSubscriptions('wallet1', 10, 1);

            expect(postgresDataHelper.findDataFromJoinModels).toHaveBeenCalledWith(
                expect.any(String),
                { wallet_address: 'wallet1' },
                expect.any(Array),
                expect.any(Array),
                expect.objectContaining({
                    order: [['createdAt', 'DESC']],
                })
            );
        });

        it('should return error if database exception occurs', async () => {
            (postgresDataHelper.findDataFromJoinModels as jest.Mock).mockRejectedValue(new Error('DB Error'));

            const result = await SubscriptionHelper.getRenewSubscriptions('wallet1');

            expect(result).toEqual({
                status: STATUS_CODES.INTERNALSERVER,
                message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
                error: true
            });
        });

        it('should handle subscriptions with undefined provider_address', async () => {
            const pastDate = new Date(Date.now() - 86400000).toISOString();
            const mockSubscriptions = [
                {
                    id: 1,
                    wallet_address: 'wallet1',
                    plan_id: 'plan1',
                    inactive_at: pastDate,
                    plans: {
                        provider_address: undefined,
                        providers: { name: 'Provider 1' }
                    },
                    toJSON: function () { return { ...this }; }
                }
            ];
            (postgresDataHelper.findDataFromJoinModels as jest.Mock).mockResolvedValue(mockSubscriptions);

            const result = await SubscriptionHelper.getRenewSubscriptions('wallet1');

            expect(result.status).toBe(STATUS_CODES.SUCCESS);
            expect(result.data.subscriptions).toHaveLength(1);
        });
    });
});
