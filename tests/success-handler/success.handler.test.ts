import successHandler from '../../src/success-handler/success.handler';
import { STATUS_CODES, RESPONSE_MESSAGES } from '../../src/constants/index';

describe('successHandler', () => {
    it('should return success response with default status and message', () => {
        const result = successHandler({
            status: STATUS_CODES.SUCCESS,
            message: RESPONSE_MESSAGES.BASE_SUCCESS_MESSAGE
        });

        expect(result).toEqual({
            error: false,
            status: STATUS_CODES.SUCCESS,
            message: RESPONSE_MESSAGES.BASE_SUCCESS_MESSAGE,
            data: undefined
        });
    });

    it('should return success response with custom status and message', () => {
        const result = successHandler({
            status: STATUS_CODES.SUCCESS,
            message: 'Operation completed successfully'
        });

        expect(result).toEqual({
            error: false,
            status: STATUS_CODES.SUCCESS,
            message: 'Operation completed successfully',
            data: undefined
        });
    });

    it('should return success response with data', () => {
        const testData = { userId: 123, name: 'John Doe' };
        const result = successHandler({
            data: testData,
            status: STATUS_CODES.SUCCESS,
            message: 'User fetched successfully'
        });

        expect(result).toEqual({
            error: false,
            status: STATUS_CODES.SUCCESS,
            message: 'User fetched successfully',
            data: testData
        });
    });

    it('should handle array data', () => {
        const testData = [{ id: 1 }, { id: 2 }];
        const result = successHandler({
            data: testData,
            status: STATUS_CODES.SUCCESS,
            message: 'List fetched'
        });

        expect(result).toEqual({
            error: false,
            status: STATUS_CODES.SUCCESS,
            message: 'List fetched',
            data: testData
        });
    });
});
