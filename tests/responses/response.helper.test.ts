import sendResponse from '../../src/responses/response.helper';
import { STATUS_CODES, RESPONSE_MESSAGES } from '../../src/constants/index';

describe('sendResponse', () => {
    let res: any;

    beforeEach(() => {
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };
    });

    it('should send response with custom message and status', () => {
        sendResponse(res, {
            status: STATUS_CODES.SUCCESS,
            message: 'Success message',
            data: { id: 1 }
        });

        expect(res.status).toHaveBeenCalledWith(STATUS_CODES.SUCCESS);
        expect(res.send).toHaveBeenCalledWith({
            message: 'Success message',
            status: STATUS_CODES.SUCCESS,
            data: { id: 1 }
        });
    });

    it('should send response with default status when not provided', () => {
        sendResponse(res, {
            message: 'Test message',
            data: { test: true }
        });

        expect(res.status).toHaveBeenCalledWith(STATUS_CODES.SUCCESS);
        expect(res.send).toHaveBeenCalledWith({
            message: 'Test message',
            status: STATUS_CODES.SUCCESS,
            data: { test: true }
        });
    });

    it('should handle INTERNAL_SERVER_ERROR status', () => {
        sendResponse(res, {
            status: STATUS_CODES.INTERNALSERVER,
            message: 'Some error'
        });

        expect(res.status).toHaveBeenCalledWith(STATUS_CODES.INTERNALSERVER);
        expect(res.send).toHaveBeenCalledWith({
            message: 'Some error',
            status: STATUS_CODES.INTERNALSERVER,
            data: undefined
        });
    });

    it('should handle NOT_FOUND status with custom message', () => {
        sendResponse(res, {
            status: STATUS_CODES.NOTFOUND,
            message: 'Resource not found'
        });

        expect(res.status).toHaveBeenCalledWith(STATUS_CODES.NOTFOUND);
        expect(res.send).toHaveBeenCalledWith({
            message: 'Resource not found',
            status: STATUS_CODES.NOTFOUND
        });
    });

    it('should handle NOT_FOUND status with default message', () => {
        sendResponse(res, {
            status: STATUS_CODES.NOTFOUND
        });

        expect(res.status).toHaveBeenCalledWith(STATUS_CODES.NOTFOUND);
        expect(res.send).toHaveBeenCalledWith({
            message: RESPONSE_MESSAGES.NOT_FOUND,
            status: STATUS_CODES.NOTFOUND
        });
    });

    it('should send data only when no message and status is success', () => {
        sendResponse(res, {
            data: { result: 'test' }
        });

        expect(res.status).toHaveBeenCalledWith(STATUS_CODES.SUCCESS);
        expect(res.send).toHaveBeenCalledWith({
            data: { result: 'test' }
        });
    });
});
