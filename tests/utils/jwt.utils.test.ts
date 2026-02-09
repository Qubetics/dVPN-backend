import * as jwtUtils from '../../src/utils/jwt.utils';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

// Mock environment variables before importing
process.env.ACCESS_TOKEN_SECRET = 'test-access-secret';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret';
process.env.ACCESS_TOKEN_EXPIRY = '15m';
process.env.REFRESH_TOKEN_EXPIRY = '7d';

describe('JWT Utils', () => {
    const mockPayload = {
        wallet_address: 'wallet123',
        access_uuid: 'uuid-access',
        refresh_uuid: 'uuid-refresh'
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('generateAccessToken', () => {
        it('should generate a token using jwt.sign', () => {
            const mockToken = 'mock-access-token';
            (jwt.sign as jest.Mock).mockReturnValue(mockToken);

            const token = jwtUtils.generateAccessToken(mockPayload);

            expect(jwt.sign).toHaveBeenCalledWith(
                mockPayload,
                expect.any(String),
                expect.any(Object)
            );
            expect(token).toBe(mockToken);
        });
    });

    describe('generateRefreshToken', () => {
        it('should generate a token using jwt.sign', () => {
            const mockToken = 'mock-refresh-token';
            (jwt.sign as jest.Mock).mockReturnValue(mockToken);

            const token = jwtUtils.generateRefreshToken(mockPayload);

            expect(jwt.sign).toHaveBeenCalledWith(
                mockPayload,
                expect.any(String),
                expect.any(Object)
            );
            expect(token).toBe(mockToken);
        });
    });

    describe('verifyAccessToken', () => {
        it('should verify and return payload for valid token', () => {
            (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

            const result = jwtUtils.verifyAccessToken('valid-token');

            expect(jwt.verify).toHaveBeenCalledWith('valid-token', expect.any(String));
            expect(result).toEqual(mockPayload);
        });

        it('should return null for invalid token', () => {
            (jwt.verify as jest.Mock).mockImplementation(() => {
                throw new Error('Invalid token');
            });

            const result = jwtUtils.verifyAccessToken('invalid-token');
            expect(result).toBeNull();
        });
    });

    describe('verifyRefreshToken', () => {
        it('should verify and return payload for valid token', () => {
            (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

            const result = jwtUtils.verifyRefreshToken('valid-refresh-token');

            expect(jwt.verify).toHaveBeenCalledWith('valid-refresh-token', expect.any(String));
            expect(result).toEqual(mockPayload);
        });

        it('should return null for invalid token', () => {
            (jwt.verify as jest.Mock).mockImplementation(() => {
                throw new Error('Invalid token');
            });

            const result = jwtUtils.verifyRefreshToken('invalid-token');
            expect(result).toBeNull();
        });
    });

    describe('decodeToken', () => {
        it('should decode token without verification', () => {
            (jwt.decode as jest.Mock).mockReturnValue(mockPayload);

            const result = jwtUtils.decodeToken('some-token');

            expect(jwt.decode).toHaveBeenCalledWith('some-token');
            expect(result).toEqual(mockPayload);
        });

        it('should return null when decode fails', () => {
            (jwt.decode as jest.Mock).mockImplementation(() => {
                throw new Error('Decode error');
            });

            const result = jwtUtils.decodeToken('invalid-format');
            expect(result).toBeNull();
        });
    });
    describe('Initialization', () => {
        it('should log error if initialization fails', async () => {
            const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

            jest.isolateModules(() => {
                // Mock initiate to return false
                jest.doMock('../../src/config/index', () => ({
                    initiate: jest.fn().mockResolvedValue(false)
                }));

                // Re-require the module to trigger the IIFE
                require('../../src/utils/jwt.utils');
            });

            // Wait for async IIFE to complete
            await new Promise(resolve => setTimeout(resolve, 100));

            // log.red uses ANSI color codes: console.log('\x1b[31m', 'message', '\x1b[39m')
            expect(consoleLogSpy).toHaveBeenCalledWith('\x1b[31m', 'Failed to load environment config', '\x1b[39m');
            consoleLogSpy.mockRestore();
        });
    });
});
