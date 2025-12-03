import redisHelper from '../../src/helpers/redis.helper';
import * as redis from 'redis';

jest.mock('redis');

describe('Redis Helper', () => {
    let mockClient: any;
    let eventCallbacks: { [key: string]: Function };

    beforeEach(() => {
        eventCallbacks = {};
        mockClient = {
            connect: jest.fn().mockResolvedValue(undefined),
            disconnect: jest.fn().mockResolvedValue(undefined),
            hSet: jest.fn().mockResolvedValue(1),
            hGetAll: jest.fn().mockResolvedValue({}),
            del: jest.fn().mockResolvedValue(1),
            expire: jest.fn().mockResolvedValue(1),
            expireAt: jest.fn().mockResolvedValue(1),
            on: jest.fn((event: string, callback: Function) => {
                eventCallbacks[event] = callback;
                return mockClient;
            })
        };

        (redis.createClient as jest.Mock).mockReturnValue(mockClient);
        jest.clearAllMocks();
    });

    describe('connectRedis', () => {
        it('should connect to redis successfully', async () => {
            const result = await redisHelper.connectRedis();

            expect(redis.createClient).toHaveBeenCalled();
            expect(mockClient.connect).toHaveBeenCalled();
            expect(result).toBe(true);
        });

        it('should return false on connection error', async () => {
            // Suppress console.log during this test
            const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

            mockClient.connect.mockRejectedValue(new Error('Connection failed'));

            const result = await redisHelper.connectRedis();

            expect(result).toBe(false);

            // Restore console.log
            consoleLogSpy.mockRestore();
        });

        it('should bind redis client events on connect', async () => {
            await redisHelper.connectRedis();

            // Verify that event listeners were registered
            expect(mockClient.on).toHaveBeenCalledWith('connect', expect.any(Function));
            expect(mockClient.on).toHaveBeenCalledWith('ready', expect.any(Function));
            expect(mockClient.on).toHaveBeenCalledWith('error', expect.any(Function));
            expect(mockClient.on).toHaveBeenCalledWith('end', expect.any(Function));
            expect(mockClient.on).toHaveBeenCalledWith('reconnecting', expect.any(Function));
        });
    });

    describe('Event callbacks', () => {
        it('should execute connect event callback', async () => {
            const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

            await redisHelper.connectRedis();

            // Trigger the connect callback
            eventCallbacks['connect']();

            expect(consoleLogSpy).toHaveBeenCalled();
            consoleLogSpy.mockRestore();
        });

        it('should execute ready event callback', async () => {
            const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

            await redisHelper.connectRedis();

            // Trigger the ready callback
            eventCallbacks['ready']();

            expect(consoleLogSpy).toHaveBeenCalled();
            consoleLogSpy.mockRestore();
        });

        it('should execute error event callback', async () => {
            const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

            await redisHelper.connectRedis();

            // Trigger the error callback
            eventCallbacks['error'](new Error('Redis connection error'));

            expect(consoleLogSpy).toHaveBeenCalled();
            consoleLogSpy.mockRestore();
        });

        it('should execute end event callback', async () => {
            const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

            await redisHelper.connectRedis();

            // Trigger the end callback
            eventCallbacks['end']();

            expect(consoleLogSpy).toHaveBeenCalled();
            consoleLogSpy.mockRestore();
        });

        it('should execute reconnecting event callback', async () => {
            const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

            await redisHelper.connectRedis();

            // Trigger the reconnecting callback
            eventCallbacks['reconnecting']();

            expect(consoleLogSpy).toHaveBeenCalled();
            consoleLogSpy.mockRestore();
        });
    });

    describe('releaseRedisConnection', () => {
        it('should disconnect from redis', async () => {
            redisHelper.client = mockClient;

            await redisHelper.releaseRedisConnection();

            expect(mockClient.disconnect).toHaveBeenCalled();
        });
    });

    describe('storeInRedis', () => {
        it('should store data in redis', async () => {
            redisHelper.client = mockClient;
            const data = { key1: 'value1', key2: 'value2' };

            const result = await redisHelper.storeInRedis('hashMap1', data);

            expect(mockClient.hSet).toHaveBeenCalledWith('hashMap1', data);
            expect(result).toBe(1);
        });

        it('should store data with expiration', async () => {
            redisHelper.client = mockClient;
            const data = { key1: 'value1' };
            const expiration = 3600;

            await redisHelper.storeInRedis('hashMap1', data, expiration);

            expect(mockClient.hSet).toHaveBeenCalledWith('hashMap1', data);
            expect(mockClient.expireAt).toHaveBeenCalledWith('hashMap1', expiration);
        });

        it('should return null on error', async () => {
            redisHelper.client = mockClient;
            mockClient.hSet.mockRejectedValue(new Error('Store failed'));

            const result = await redisHelper.storeInRedis('hashMap1', {});

            expect(result).toBeNull();
        });
    });

    describe('getDataFromRedis', () => {
        it('should retrieve data from redis', async () => {
            redisHelper.client = mockClient;
            const mockData = { key1: 'value1' };
            mockClient.hGetAll.mockResolvedValue(mockData);

            const result = await redisHelper.getDataFromRedis('hashMap1');

            expect(mockClient.hGetAll).toHaveBeenCalledWith('hashMap1');
            expect(result).toEqual(mockData);
        });

        it('should return null on error', async () => {
            redisHelper.client = mockClient;
            mockClient.hGetAll.mockRejectedValue(new Error('Get failed'));

            const result = await redisHelper.getDataFromRedis('hashMap1');

            expect(result).toBeNull();
        });
    });

    describe('removeFromRedis', () => {
        it('should remove data from redis', async () => {
            redisHelper.client = mockClient;

            const result = await redisHelper.removeFromRedis('token123');

            expect(mockClient.del).toHaveBeenCalledWith('token123');
            expect(result).toBe(1);
        });
        it('should return null on error', async () => {
            redisHelper.client = mockClient;
            mockClient.del.mockImplementation(() => { throw new Error('Delete failed'); });

            const result = await redisHelper.removeFromRedis('token123');

            expect(result).toBeNull();
        });
    });

    describe('_bindRedisClientEvents', () => {
        it('should handle error during event binding', async () => {
            const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

            // Mock client.on to throw error
            mockClient.on.mockImplementation(() => {
                throw new Error('Binding failed');
            });

            await redisHelper.connectRedis();

            expect(consoleLogSpy).toHaveBeenCalled();
            consoleLogSpy.mockRestore();
        });
    });

    describe('updateRedisTime', () => {
        it('should update expiration time', async () => {
            redisHelper.client = mockClient;

            const result = await redisHelper.updateRedisTime('token123', 3600);

            expect(mockClient.expire).toHaveBeenCalledWith('token123', 3600);
            expect(result).toBe(1);
        });

        it('should return null on error', async () => {
            // Suppress console.log during this test
            const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

            redisHelper.client = mockClient;
            mockClient.expire.mockRejectedValue(new Error('Update failed'));

            const result = await redisHelper.updateRedisTime('token123', 3600);

            expect(result).toBeNull();

            // Restore console.log
            consoleLogSpy.mockRestore();
        });
    });

    describe('getInstance', () => {
        it('should return same instance when called multiple times', () => {
            const instance1 = (redisHelper as any).constructor.getInstance();
            const instance2 = (redisHelper as any).constructor.getInstance();
            expect(instance1).toBe(instance2);
            expect(instance1).toBe(redisHelper);
        });
    });
});
