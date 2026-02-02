import NodeHelper from '../../src/controller-helpers/node.helpers';
import postgresDataHelper from '../../src/helpers/postgres.data.helper';
import { RESPONSE_MESSAGES, STATUS_CODES, DATA_MODELS, ACTIVE } from '../../src/constants/index';

// Mock postgresDataHelper
jest.mock('../../src/helpers/postgres.data.helper', () => ({
    findOneData: jest.fn(),
    findGroupedData: jest.fn(),
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

describe('NodeHelper', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('nodeList', () => {
        it('should return error if planId is missing', async () => {
            const result = await NodeHelper.nodeList();
            expect(result).toEqual({
                status: STATUS_CODES.BADREQUEST,
                message: "planId is required to fetch nodes",
                error: true
            });
        });

        it('should return error if walletAddress is provided but plan not purchased', async () => {
            (postgresDataHelper.findOneData as jest.Mock).mockResolvedValue(null);
            const result = await NodeHelper.nodeList(undefined, undefined, undefined, undefined, undefined, undefined, 'plan1', undefined, 'wallet1');
            expect(result).toEqual({
                status: STATUS_CODES.BADREQUEST,
                message: "You need to buy this plan first",
                error: true
            });
        });

        it('should return node if nodeAddress is provided', async () => {
            const mockNode = { address: 'node1' };
            (postgresDataHelper.findOneData as jest.Mock).mockResolvedValue(mockNode);
            const result = await NodeHelper.nodeList(undefined, undefined, undefined, 'node1', undefined, undefined, 'plan1');
            expect(result).toEqual({
                data: mockNode,
                status: STATUS_CODES.SUCCESS,
                message: RESPONSE_MESSAGES.FETCH_DATA_SUCCESS,
                error: false
            });
        });

        it('should return countries list if no country/city provided', async () => {
            const mockCountries = [{ country: 'US', node_count: 10 }];
            (postgresDataHelper.findGroupedData as jest.Mock).mockResolvedValue(mockCountries);
            const result = await NodeHelper.nodeList(undefined, undefined, undefined, undefined, undefined, undefined, 'plan1');
            expect(result).toEqual({
                data: { countries: mockCountries },
                status: STATUS_CODES.SUCCESS,
                message: RESPONSE_MESSAGES.FETCH_DATA_SUCCESS,
                error: false
            });
        });

        it('should return cities list if country provided but no city', async () => {
            const mockCities = [{ city: 'NY', node_count: 5, flag_url: 'url' }];
            (postgresDataHelper.findGroupedData as jest.Mock).mockResolvedValue(mockCities);
            const result = await NodeHelper.nodeList(undefined, undefined, undefined, undefined, 'US', undefined, 'plan1');
            expect(result).toEqual({
                data: {
                    country: 'US',
                    flag_url: 'url',
                    cities: [{ city: 'NY', node_count: 5 }]
                },
                status: STATUS_CODES.SUCCESS,
                message: RESPONSE_MESSAGES.FETCH_DATA_SUCCESS,
                error: false
            });
        });

        it('should return nodes list if country and city provided', async () => {
            const mockNodes = [{ address: 'node1' }];
            (postgresDataHelper.findDataFromJoinModels as jest.Mock).mockResolvedValue(mockNodes);
            const result = await NodeHelper.nodeList(undefined, undefined, undefined, undefined, 'US', 'NY', 'plan1');
            expect(result).toEqual({
                data: { nodes: mockNodes },
                status: STATUS_CODES.SUCCESS,
                message: RESPONSE_MESSAGES.FETCH_DATA_SUCCESS,
                error: false
            });
        });

        it('should return success if walletAddress is provided and plan is purchased', async () => {
            const mockNode = { address: 'node1' };
            (postgresDataHelper.findOneData as jest.Mock)
                .mockResolvedValueOnce({ id: 1 }) // hasPlan
                .mockResolvedValueOnce(mockNode); // node

            const result = await NodeHelper.nodeList(undefined, undefined, undefined, 'node1', undefined, undefined, 'plan1', undefined, 'wallet1');

            expect(result).toEqual({
                data: mockNode,
                status: STATUS_CODES.SUCCESS,
                message: RESPONSE_MESSAGES.FETCH_DATA_SUCCESS,
                error: false
            });
        });

        it('should return UNAUTHORIZED if nodeAddress provided but node not found', async () => {
            (postgresDataHelper.findOneData as jest.Mock).mockResolvedValue(null);
            const result = await NodeHelper.nodeList(undefined, undefined, undefined, 'node1', undefined, undefined, 'plan1');
            expect(result).toEqual({
                status: STATUS_CODES.BADREQUEST,
                message: RESPONSE_MESSAGES.UNAUTHORIZED,
                error: true
            });
        });

        it('should handle protocolType filter', async () => {
            const mockCountries = [{ country: 'US', node_count: 10 }];
            (postgresDataHelper.findGroupedData as jest.Mock).mockResolvedValue(mockCountries);

            await NodeHelper.nodeList(undefined, undefined, undefined, undefined, undefined, undefined, 'plan1', 'tcp');

            expect(postgresDataHelper.findGroupedData).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({ protocol: 'tcp' }),
                expect.anything(),
                expect.anything()
            );
        });

    });

    describe('getRandomNode', () => {
        it('should return error if walletAddress is missing', async () => {
            const result = await NodeHelper.getRandomNode('', 'all');
            expect(result).toEqual({
                status: STATUS_CODES.BADREQUEST,
                message: "Wallet address is required",
                error: true
            });
        });

        it('should return random node', async () => {
            const mockNode = { address: 'node1' };
            (postgresDataHelper.findDataFromJoinModels as jest.Mock).mockResolvedValue([mockNode]);
            const result = await NodeHelper.getRandomNode('wallet1', 'all');
            expect(result).toEqual({
                data: mockNode,
                status: STATUS_CODES.SUCCESS,
                message: "Random node fetched successfully",
                error: false
            });
        });

        it('should return error if no nodes found', async () => {
            (postgresDataHelper.findDataFromJoinModels as jest.Mock).mockResolvedValue([]);
            const result = await NodeHelper.getRandomNode('wallet1', 'all');
            expect(result).toEqual({
                status: STATUS_CODES.NOTFOUND,
                message: "No nodes found for this wallet address",
                error: true
            });
        });

        it('should handle protocol filter', async () => {
            const mockNode = { address: 'node1' };
            (postgresDataHelper.findDataFromJoinModels as jest.Mock).mockResolvedValue([mockNode]);

            await NodeHelper.getRandomNode('wallet1', 'tcp');

            expect(postgresDataHelper.findDataFromJoinModels).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({ protocol: 'tcp' }),
                expect.anything(),
                expect.anything(),
                expect.anything()
            );
        });
    });
});
