import PlanHelper from '../../src/controller-helpers/plan.helpers';
import postgresDataHelper from '../../src/helpers/postgres.data.helper';
import axios from 'axios';
import { RESPONSE_MESSAGES, STATUS_CODES } from '../../src/constants/index';

// Mock postgresDataHelper
jest.mock('../../src/helpers/postgres.data.helper', () => ({
    findDataFromJoinModels: jest.fn(),
    findOneData: jest.fn(),
    saveData: jest.fn(),
}));

// Mock axios
jest.mock('axios');

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

describe('PlanHelper', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllPlans', () => {
        it('should return error if providerAddress is missing', async () => {
            const result = await PlanHelper.getAllPlans('');
            expect(result).toEqual({
                message: "Provider is mandatory",
                status: STATUS_CODES.BADREQUEST,
                error: true
            });
        });

        it('should return merged plans', async () => {
            const mockPlans = [
                { plan_id: 'p1', hours: 1, prices: 10, country: 'US', node_count: 5, flag_url: 'url' }
            ];
            (postgresDataHelper.findDataFromJoinModels as jest.Mock).mockResolvedValue(mockPlans);

            const result = await PlanHelper.getAllPlans('provider1');
            expect(result).toEqual({
                status: STATUS_CODES.SUCCESS,
                message: RESPONSE_MESSAGES.PLAN_FETCH_SUCCESS,
                data: [{
                    plan_id: 'p1',
                    hours: 1,
                    prices: 10,
                    countries: [{ country: 'US', node_count: 5, flag_url: 'url' }]
                }],
                error: false
            });
        });
    });
});
