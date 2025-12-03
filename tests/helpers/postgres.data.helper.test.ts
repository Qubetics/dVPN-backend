import postgresDataHelper from '../../src/helpers/postgres.data.helper';
import { DATA_MODELS } from '../../src/constants/index';
import User from '../../src/model/user/index';
import Node from '../../src/model/nodes/index';
import Plans from '../../src/model/plans/index';

jest.mock('../../src/model/user/index');
jest.mock('../../src/model/nodes/index');
jest.mock('../../src/model/plans/index');
jest.mock('../../src/model/subscriptions/index');
jest.mock('../../src/model/session/index');
jest.mock('../../src/model/user-session/index');
jest.mock('../../src/model/plan-purchase');
jest.mock('../../src/model/provider/index');

describe('PostgresDataHelper', () => {
    let consoleLogSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
        consoleLogSpy.mockRestore();
    });

    describe('getCount', () => {
        it('should get count with query', async () => {
            const mockCount = jest.fn().mockResolvedValue(5);
            (User as any).count = mockCount;

            const result = await postgresDataHelper.getCount(DATA_MODELS.User, { active: true });

            expect(mockCount).toHaveBeenCalledWith({ active: true });
            expect(result).toBe(5);
        });

        it('should get count without query', async () => {
            const mockCount = jest.fn().mockResolvedValue(10);
            (User as any).count = mockCount;

            const result = await postgresDataHelper.getCount(DATA_MODELS.User);

            expect(mockCount).toHaveBeenCalled();
            expect(result).toBe(10);
        });

        it('should return null on error', async () => {
            const mockCount = jest.fn().mockRejectedValue(new Error('Count failed'));
            (User as any).count = mockCount;

            const result = await postgresDataHelper.getCount(DATA_MODELS.User);

            expect(result).toBeNull();
        });
    });

    describe('saveData', () => {
        it('should save data successfully', async () => {
            const mockCreate = jest.fn().mockResolvedValue({ id: 1, name: 'Test' });
            (User as any).create = mockCreate;

            const data = { name: 'Test' };
            const result = await postgresDataHelper.saveData(DATA_MODELS.User, data);

            expect(mockCreate).toHaveBeenCalledWith(data);
            expect(result).toEqual({ id: 1, name: 'Test' });
        });

        it('should return null on error', async () => {
            const mockCreate = jest.fn().mockRejectedValue(new Error('Save failed'));
            (User as any).create = mockCreate;

            const result = await postgresDataHelper.saveData(DATA_MODELS.User, {});

            expect(result).toBeNull();
        });
    });

    describe('findAndQueryData', () => {
        it('should find data with query', async () => {
            const mockData = [{ id: 1 }, { id: 2 }];
            const mockFindAll = jest.fn().mockResolvedValue(mockData);
            (User as any).findAll = mockFindAll;

            const query = { where: { active: true } };
            const result = await postgresDataHelper.findAndQueryData(DATA_MODELS.User, query);

            expect(mockFindAll).toHaveBeenCalledWith(query);
            expect(result).toEqual(mockData);
        });

        it('should return null on error', async () => {
            const mockFindAll = jest.fn().mockRejectedValue(new Error('Find failed'));
            (User as any).findAll = mockFindAll;

            const result = await postgresDataHelper.findAndQueryData(DATA_MODELS.User, {});

            expect(result).toBeNull();
        });
    });

    describe('findAndCountAll', () => {
        it('should find and count data', async () => {
            const mockResult = { count: 5, rows: [{ id: 1 }] };
            const mockFindAndCountAll = jest.fn().mockResolvedValue(mockResult);
            (User as any).findAndCountAll = mockFindAndCountAll;

            const query = { where: { active: true } };
            const result = await postgresDataHelper.findAndCountAll(DATA_MODELS.User, query);

            expect(mockFindAndCountAll).toHaveBeenCalledWith(query);
            expect(result).toEqual(mockResult);
        });

        it('should return null on error', async () => {
            const mockFindAndCountAll = jest.fn().mockRejectedValue(new Error('Find failed'));
            (User as any).findAndCountAll = mockFindAndCountAll;

            const result = await postgresDataHelper.findAndCountAll(DATA_MODELS.User, {});

            expect(result).toBeNull();
        });
    });

    describe('findOneData', () => {
        it('should find one data record', async () => {
            const mockData = { id: 1, name: 'Test' };
            const mockFindOne = jest.fn().mockResolvedValue(mockData);
            (User as any).findOne = mockFindOne;

            const query = { where: { id: 1 } };
            const result = await postgresDataHelper.findOneData(DATA_MODELS.User, query);

            expect(mockFindOne).toHaveBeenCalledWith(query);
            expect(result).toEqual(mockData);
        });

        it('should return null on error', async () => {
            const mockFindOne = jest.fn().mockRejectedValue(new Error('Find failed'));
            (User as any).findOne = mockFindOne;

            const result = await postgresDataHelper.findOneData(DATA_MODELS.User, {});

            expect(result).toBeNull();
        });
    });

    describe('findDataOfSelectedColumns', () => {
        it('should find data with selected columns', async () => {
            const mockData = [{ id: 1 }, { id: 2 }];
            const mockFindAll = jest.fn().mockResolvedValue(mockData);
            (User as any).findAll = mockFindAll;

            const query = { active: true };
            const attributes = ['id', 'name'];
            const result = await postgresDataHelper.findDataOfSelectedColumns(
                DATA_MODELS.User,
                query,
                attributes
            );

            expect(mockFindAll).toHaveBeenCalledWith({
                where: query,
                attributes: attributes
            });
            expect(result).toEqual(mockData);
        });

        it('should return null on error', async () => {
            const mockFindAll = jest.fn().mockRejectedValue(new Error('Find failed'));
            (User as any).findAll = mockFindAll;

            const result = await postgresDataHelper.findDataOfSelectedColumns(DATA_MODELS.User, {}, []);

            expect(result).toBeNull();
        });
    });

    describe('updateData', () => {
        it('should update data successfully', async () => {
            const mockUpdate = jest.fn().mockResolvedValue([1]);
            (User as any).update = mockUpdate;

            const query = { where: { id: 1 } };
            const update = { name: 'Updated' };
            const result = await postgresDataHelper.updateData(DATA_MODELS.User, query, update);

            expect(mockUpdate).toHaveBeenCalledWith(update, query);
            expect(result).toEqual([1]);
        });

        it('should return null on error', async () => {
            const mockUpdate = jest.fn().mockRejectedValue(new Error('Update failed'));
            (User as any).update = mockUpdate;

            const result = await postgresDataHelper.updateData(DATA_MODELS.User, {}, {});

            expect(result).toBeNull();
        });
    });

    describe('findGroupedData', () => {
        it('should find grouped data', async () => {
            const mockData = [{ country: 'US', count: 5 }];
            const mockFindAll = jest.fn().mockResolvedValue(mockData);
            (Node as any).findAll = mockFindAll;

            const whereClause = { active: true };
            const attributes = ['country', ['COUNT', 'id']];
            const groupFields = 'country';

            const result = await postgresDataHelper.findGroupedData(
                DATA_MODELS.Node,
                whereClause,
                attributes,
                groupFields
            );

            expect(mockFindAll).toHaveBeenCalledWith({
                where: whereClause,
                attributes: attributes,
                group: groupFields,
                raw: true,
                subQuery: false
            });
            expect(result).toEqual(mockData);
        });

        it('should return null on error', async () => {
            const mockFindAll = jest.fn().mockRejectedValue(new Error('Group failed'));
            (Node as any).findAll = mockFindAll;

            const result = await postgresDataHelper.findGroupedData(DATA_MODELS.Node, {}, [], 'field');

            expect(result).toBeNull();
        });
    });

    describe('deleteData', () => {
        it('should delete data successfully', async () => {
            const mockDestroy = jest.fn().mockResolvedValue(1);
            (User as any).destroy = mockDestroy;

            const query = { id: 1 };
            const result = await postgresDataHelper.deleteData(DATA_MODELS.User, query);

            expect(mockDestroy).toHaveBeenCalledWith({ where: query });
            expect(result).toBe(1);
        });

        it('should return null on error', async () => {
            const mockDestroy = jest.fn().mockRejectedValue(new Error('Delete failed'));
            (User as any).destroy = mockDestroy;

            const result = await postgresDataHelper.deleteData(DATA_MODELS.User, {});

            expect(result).toBeNull();
        });
    });

    describe('findDataFromJoinModels', () => {
        it('should find data from joined models', async () => {
            const mockData = [{ id: 1, plan: { name: 'Premium' } }];
            const mockFindAll = jest.fn().mockResolvedValue(mockData);
            (User as any).findAll = mockFindAll;

            const whereClause = { active: true };
            const attributes = ['id', 'name'];
            const include = [{ model: Plans }];
            const options = { limit: 10, offset: 0, order: [['id', 'DESC']] };

            const result = await postgresDataHelper.findDataFromJoinModels(
                DATA_MODELS.User,
                whereClause,
                attributes,
                include,
                options
            );

            expect(mockFindAll).toHaveBeenCalledWith({
                where: whereClause,
                attributes: attributes,
                include: include,
                limit: 10,
                offset: 0,
                order: [['id', 'DESC']],
                group: undefined,
                raw: true,
                subQuery: false
            });
            expect(result).toEqual(mockData);
        });

        it('should return null on error', async () => {
            const mockFindAll = jest.fn().mockRejectedValue(new Error('Join failed'));
            (User as any).findAll = mockFindAll;

            const result = await postgresDataHelper.findDataFromJoinModels(
                DATA_MODELS.User,
                {},
                [],
                [],
                {}
            );

            expect(result).toBeNull();
        });
    });

    describe('_checkModel', () => {
        it('should throw error for invalid model', () => {
            expect(() => {
                (postgresDataHelper as any)._checkModel('InvalidModel');
            }).toThrow('Model is not defined.');
        });

        it('should not throw error for valid model', () => {
            expect(() => {
                (postgresDataHelper as any)._checkModel(DATA_MODELS.User);
            }).not.toThrow();
        });
    });

    describe('_getModel', () => {
        it('should return null for unknown model', () => {
            const result = (postgresDataHelper as any)._getModel('UnknownModel');
            expect(result).toBeNull();
        });

        it('should return User model for DATA_MODELS.User', () => {
            const result = (postgresDataHelper as any)._getModel(DATA_MODELS.User);
            expect(result).toBe(User);
        });

        it('should return Node model for DATA_MODELS.Node', () => {
            const result = (postgresDataHelper as any)._getModel(DATA_MODELS.Node);
            expect(result).toBe(Node);
        });

        it('should return Plans model for DATA_MODELS.Plans', () => {
            const result = (postgresDataHelper as any)._getModel(DATA_MODELS.Plans);
            expect(result).toBe(Plans);
        });

        it('should return Subscriptions model for DATA_MODELS.Subscriptions', () => {
            const Subscriptions = require('../../src/model/subscriptions/index').default;
            const result = (postgresDataHelper as any)._getModel(DATA_MODELS.Subscriptions);
            expect(result).toBe(Subscriptions);
        });

        it('should return Sessions model for DATA_MODELS.Sessions', () => {
            const Sessions = require('../../src/model/session/index').default;
            const result = (postgresDataHelper as any)._getModel(DATA_MODELS.Sessions);
            expect(result).toBe(Sessions);
        });

        it('should return UserSessions model for DATA_MODELS.UserSession', () => {
            const UserSessions = require('../../src/model/user-session/index').default;
            const result = (postgresDataHelper as any)._getModel(DATA_MODELS.UserSession);
            expect(result).toBe(UserSessions);
        });

        it('should return PlanPurchase model for DATA_MODELS.PlanPurchase', () => {
            const PlanPurchase = require('../../src/model/plan-purchase').default;
            const result = (postgresDataHelper as any)._getModel(DATA_MODELS.PlanPurchase);
            expect(result).toBe(PlanPurchase);
        });

        it('should return Providers model for DATA_MODELS.Providers', () => {
            const Providers = require('../../src/model/provider/index').default;
            const result = (postgresDataHelper as any)._getModel(DATA_MODELS.Providers);
            expect(result).toBe(Providers);
        });
    });
});
