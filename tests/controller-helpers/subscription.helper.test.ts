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

        it('should return subscription list', async () => {
            const mockSubscriptions = [{ id: 1, wallet_address: 'wallet1' }];
            (postgresDataHelper.findDataFromJoinModels as jest.Mock).mockResolvedValue(mockSubscriptions);

            const result = await SubscriptionHelper.getSubscritptionsList('wallet1');
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
    });
});
