import errorHandler from '../../src/error-handler/error.handler';
import { STATUS_CODES, RESPONSE_MESSAGES } from '../../src/constants/index';

describe('errorHandler', () => {
    it('should return error response with default status and message', () => {
        const result = errorHandler({
            status: STATUS_CODES.INTERNALSERVER,
            message: RESPONSE_MESSAGES.BASE_SUCCESS_MESSAGE
        });

        expect(result).toEqual({
            error: true,
            status: STATUS_CODES.INTERNALSERVER,
            message: RESPONSE_MESSAGES.BASE_SUCCESS_MESSAGE
        });
    });

    it('should return error response with custom status and message', () => {
        const result = errorHandler({
            status: STATUS_CODES.BADREQUEST,
            message: 'Custom error message'
        });

        expect(result).toEqual({
            error: true,
            status: STATUS_CODES.BADREQUEST,
            message: 'Custom error message'
        });
    });

    it('should return error response with data', () => {
        const testData = { userId: 123, error: 'Not found' };
        const result = errorHandler({
            data: testData,
            status: STATUS_CODES.NOTFOUND,
            message: 'User not found'
        });

        expect(result).toEqual({
            error: true,
            status: STATUS_CODES.NOTFOUND,
            message: 'User not found',
            data: testData
        });
    });

    it('should not include data field when data is not provided', () => {
        const result = errorHandler({
            status: STATUS_CODES.UNAUTHORIZED,
            message: 'Unauthorized access'
        });

        expect(result).toEqual({
            error: true,
            status: STATUS_CODES.UNAUTHORIZED,
            message: 'Unauthorized access'
        });
        expect(result.data).toBeUndefined();
    });
});
