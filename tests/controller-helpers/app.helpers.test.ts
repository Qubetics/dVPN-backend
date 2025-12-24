import AppHelper from '../../src/controller-helpers/app.helpers';
import { RESPONSE_MESSAGES, STATUS_CODES } from '../../src/constants/index';

describe('AppHelper', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    describe('getApplicationVersion', () => {
        it('should return application version when APP_VERSION is set', () => {
            process.env.APP_VERSION = '1.0.0';
            const result = AppHelper.getApplicationVersion();
            expect(result).toEqual({
                data: { version: '1.0.0' },
                message: RESPONSE_MESSAGES.APP_VERSION_SUCCESSFULLY_FETCH,
                status: STATUS_CODES.SUCCESS,
                error: false
            });
        });

        it('should return error when APP_VERSION is missing', () => {
            delete process.env.APP_VERSION;
            const result = AppHelper.getApplicationVersion();
            expect(result).toEqual({
                message: RESPONSE_MESSAGES.APP_VERSION_IS_MISSING,
                status: STATUS_CODES.BADREQUEST,
                error: true
            });
        });
    });

    describe('getChainURL', () => {
        it('should return chain URL when CHAIN_URL is set', () => {
            process.env.CHAIN_URL = 'http://localhost:26657';
            const result = AppHelper.getChainURL();
            expect(result).toEqual({
                data: { ChainURL: 'http://localhost:26657' },
                message: RESPONSE_MESSAGES.CHAIN_URL_SUCCESSFULLY_FETCH,
                status: STATUS_CODES.SUCCESS,
                error: false
            });
        });

        it('should return error when CHAIN_URL is missing', () => {
            delete process.env.CHAIN_URL;
            const result = AppHelper.getChainURL();
            expect(result).toEqual({
                message: RESPONSE_MESSAGES.CHAIN_URL_IS_MISSING,
                status: STATUS_CODES.BADREQUEST,
                error: true
            });
        });
    });
});
