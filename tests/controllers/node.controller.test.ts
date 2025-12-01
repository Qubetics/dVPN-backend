import NodeController from '../../src/controllers/node.controller';
import nodeHelpers from '../../src/controller-helpers/node.helpers';
import sendResponse from '../../src/responses/response.helper';
import { STATUS_CODES } from '../../src/constants/index';

// Mock dependencies
jest.mock('../../src/controller-helpers/node.helpers', () => ({
    nodeList: jest.fn(),
    getRandomNode: jest.fn(),
}));

jest.mock('../../src/responses/response.helper', () => jest.fn());

jest.mock('../../src/middleware/sessionCheck', () => ({
    sessionCheck: (req: any, res: any, next: any) => next(),
}));

describe('NodeController', () => {
    let nodeController: NodeController;
    let req: any;
    let res: any;

    beforeEach(() => {
        nodeController = new NodeController();
        req = {
            query: {},
            user: { wallet_address: 'wallet1' }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
        jest.clearAllMocks();
    });

    describe('getNodeList', () => {
        it('should call nodeHelpers.nodeList with correct parameters', async () => {
            req.query = {
                status: 'active',
                limit: '10',
                page: '1',
                count_total: 'true',
                order: 'ASC',
                address: 'addr1',
                country: 'US',
                city: 'NY',
                plan_id: 'p1',
                protocol: 'tcp'
            };

            const mockResponse = { status: STATUS_CODES.SUCCESS, data: [] };
            (nodeHelpers.nodeList as jest.Mock).mockResolvedValue(mockResponse);

            await (nodeController as any).getNodeList(req, res);

            expect(nodeHelpers.nodeList).toHaveBeenCalledWith(
                'active', 10, 1, true, 'ASC', 'addr1', 'US', 'NY', 'p1', 'tcp', 'wallet1'
            );
            expect(sendResponse).toHaveBeenCalledWith(res, mockResponse);
        });
    });

    describe('getRandomNodeData', () => {
        it('should call nodeHelpers.getRandomNode with correct parameters', async () => {
            req.query = { protocol: 'tcp' };
            const mockResponse = { status: STATUS_CODES.SUCCESS, data: {} };
            (nodeHelpers.getRandomNode as jest.Mock).mockResolvedValue(mockResponse);

            await (nodeController as any).getRandomNodeData(req, res);

            expect(nodeHelpers.getRandomNode).toHaveBeenCalledWith('wallet1', 'tcp');
            expect(sendResponse).toHaveBeenCalledWith(res, mockResponse);
        });
    });
});
