import { initiate } from '../../src/config/index';
import { config } from 'dotenv';

jest.mock('dotenv', () => ({
    config: jest.fn()
}));

describe('Config initiate', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should call dotenv config and return true', async () => {
        const result = await initiate();

        expect(config).toHaveBeenCalled();
        expect(result).toBe(true);
    });

    it('should resolve with true', async () => {
        const promise = initiate();
        expect(promise).toBeInstanceOf(Promise);

        const result = await promise;
        expect(result).toBe(true);
    });
});
