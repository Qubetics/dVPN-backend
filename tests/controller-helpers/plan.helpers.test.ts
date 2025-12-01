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

    describe('getAllNodeForPlan', () => {
        it('should return error if plan not found', async () => {
            (postgresDataHelper.findOneData as jest.Mock).mockResolvedValue(null);
            const result = await PlanHelper.getAllNodeForPlan('wallet1', 1, 10);
            expect(result).toEqual({
                status: STATUS_CODES.NOTFOUND,
                message: RESPONSE_MESSAGES.PLAN_NOT_FOUND,
                data: [],
                error: true
            });
        });

        it('should return error if no nodes found', async () => {
            (postgresDataHelper.findOneData as jest.Mock).mockResolvedValue({ planId: 'p1' });
            (postgresDataHelper.findDataFromJoinModels as jest.Mock).mockResolvedValue([]);
            const result = await PlanHelper.getAllNodeForPlan('wallet1', 1, 10);
            expect(result).toEqual({
                status: STATUS_CODES.NOTFOUND,
                message: RESPONSE_MESSAGES.NO_NODE_FOUND,
                error: true
            });
        });

        it('should return node details', async () => {
            (postgresDataHelper.findOneData as jest.Mock).mockResolvedValue({ planId: 'p1' });
            (postgresDataHelper.findDataFromJoinModels as jest.Mock).mockResolvedValue([{ node: { address: 'n1' } }]);
            const result = await PlanHelper.getAllNodeForPlan('wallet1', 1, 10);
            expect(result).toEqual({
                status: STATUS_CODES.SUCCESS,
                message: RESPONSE_MESSAGES.NODE_DETAIL_FOUND,
                data: [{ address: 'n1' }],
                error: false
            });
        });
    });

    describe('postForPlanId', () => {
        it('should return error if transaction failed', async () => {
            (axios.get as jest.Mock).mockResolvedValue({ data: { tx_response: { code: 1 } } });
            const result = await PlanHelper.postForPlanId('wallet1', 'hash');
            expect(result).toEqual({
                status: STATUS_CODES.BADREQUEST,
                message: RESPONSE_MESSAGES.FAILED_TRANSACTION
            });
        });

        it('should return error if no messages in transaction', async () => {
            (axios.get as jest.Mock).mockResolvedValue({ data: { tx_response: { code: 0 }, tx: { body: { messages: [] } } } });
            const result = await PlanHelper.postForPlanId('wallet1', 'hash');
            expect(result).toEqual({
                status: STATUS_CODES.BADREQUEST,
                message: RESPONSE_MESSAGES.NO_MESSAGE
            });
        });

        it('should return error if planId not found in message', async () => {
            (axios.get as jest.Mock).mockResolvedValue({ data: { tx_response: { code: 0 }, tx: { body: { messages: [{}] } } } });
            const result = await PlanHelper.postForPlanId('wallet1', 'hash');
            expect(result).toEqual({
                status: STATUS_CODES.BADREQUEST,
                message: RESPONSE_MESSAGES.PLAN_ID_NOT_FOUND
            });
        });

        it('should save purchase and return success', async () => {
            (axios.get as jest.Mock).mockResolvedValue({ data: { tx_response: { code: 0 }, tx: { body: { messages: [{ id: 'p1' }] } } } });
            (postgresDataHelper.saveData as jest.Mock).mockResolvedValue({ id: 1 });
            const result = await PlanHelper.postForPlanId('wallet1', 'hash');
            expect(result).toEqual({
                status: STATUS_CODES.SUCCESS,
                message: RESPONSE_MESSAGES.PLAN_ID_SUCCESS,
                data: { id: 1 }
            });
        });
    });

    describe('getPlanId', () => {
        it('should return plan id', async () => {
            (postgresDataHelper.findOneData as jest.Mock).mockResolvedValue({ planId: 'p1' });
            const result = await PlanHelper.getPlanId('wallet1');
            expect(result).toEqual({
                message: RESPONSE_MESSAGES.PLAN_ID_FETCH,
                status: STATUS_CODES.SUCCESS,
                data: { planId: 'p1' },
                error: false
            });
        });
    });
});
