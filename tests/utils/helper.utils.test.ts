import { log } from '../../src/utils/helper.utils';

describe('Logs Helper', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    it('should be a singleton instance', () => {
        const log1 = require('../../src/utils/helper.utils').log;
        const log2 = require('../../src/utils/helper.utils').log;
        expect(log1).toBe(log2);
    });

    it('should log red colored messages', () => {
        log.red('Error message', 'details');
        expect(consoleSpy).toHaveBeenCalled();
        expect(consoleSpy.mock.calls[0]).toContain('Error message');
        expect(consoleSpy.mock.calls[0]).toContain('details');
    });

    it('should log green colored messages', () => {
        log.green('Success message');
        expect(consoleSpy).toHaveBeenCalled();
        expect(consoleSpy.mock.calls[0]).toContain('Success message');
    });

    it('should log blue colored messages', () => {
        log.blue('Info message', 'extra');
        expect(consoleSpy).toHaveBeenCalled();
        expect(consoleSpy.mock.calls[0]).toContain('Info message');
        expect(consoleSpy.mock.calls[0]).toContain('extra');
    });

    it('should log normal messages', () => {
        log.log('Normal message');
        expect(consoleSpy).toHaveBeenCalledWith('Normal message');
    });

    it('should log error messages', () => {
        const errorSpy = jest.spyOn(console, 'error').mockImplementation();
        log.error('Error occurred', { code: 500 });
        expect(errorSpy).toHaveBeenCalledWith('Error occurred', { code: 500 });
        errorSpy.mockRestore();
    });
});
