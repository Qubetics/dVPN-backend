import { DATA_MODELS } from "../constants/index";
import User from "../model/user/index";
import Node from "../model/nodes/index"
import Plans from "../model/plans/index";
import Subscriptions from "../model/subscriptions/index";

class PostgresDataHelper {
  static instance: PostgresDataHelper = null;

  static getInstance = () => {
    if (!PostgresDataHelper.instance) {
      PostgresDataHelper.instance = new PostgresDataHelper();
      delete PostgresDataHelper.constructor;
    }
    return PostgresDataHelper.instance;
  };

  /**
   * get the total document count stored in choosen collection
   * @param name
   * @param query
   * @returns
   */
  public getCount = async (name: string, query?: any) => {
    try {
      this._checkModel(name);

      if (query) {
        // gets count of the number present in the db based on the query
        const result = await this._getModel(name).count(query);
        return result;
      } else {
        // gets count of all the data present in the db collection
        const result = await this._getModel(name)?.count();
        return result;
      }
    } catch (error) {
      console.log("Error while to getCount: \n", error);
      return null;
    }
  };

  /**
   * save the single data object
   * @param name
   * @param data
   * @returns
   */
  public saveData = async (name: string, data: object) => {
    try {
      this._checkModel(name);
      const Model = this._getModel(name);
      const result = await Model.create(data);
      return result;
    } catch (error) {
      console.log(error.toString());
      return null;
    }
  };

  /**
   * this helper is use to fetch data according to the query provided
   * @param name
   * @param query
   * @returns
   */
  public findAndQueryData = async (name: string, query: any) => {
    try {
      this._checkModel(name);
      const result = await this._getModel(name).findAll(query);
      return result;
    } catch (error) {
      console.log("Error while to findAndQueryData : \n", error);
      return null;
    }
  };
  /**
   * this helper is use to fetch data according to the query provided
   * @param name
   * @param query
   * @returns
   */
  public findAndCountAll = async (name: string, query: any) => {
    try {
      this._checkModel(name);
      const result = await this._getModel(name).findAndCountAll(query);
      return result;
    } catch (error) {
      console.log("Error while to findAndCountAll : \n", error);
      return null;
    }
  };

  public findOneData = async (name: string, query: any) => {
    try {
      this._checkModel(name);
      const result = await this._getModel(name).findOne(query);
      return result;
    } catch (error) {
      console.log("Error while to findOneData: \n", error);
      return null;
    }
  };

  public findDataOfSelectedColumns = async (
    name: string,
    query: any,
    attributes?: any[]
  ) => {
    try {
      this._checkModel(name);
      const result = await this._getModel(name).findAll({
        where: query,
        attributes: attributes,
      });
      return result;
    } catch (error) {
      console.log("Error while to findDataOfSelectedColumns: \n", error);
      return null;
    }
  };

  /**
   * this helper is use to update any single data field in a collections of postgresdb
   * @param name
   * @param update
   * @param query
   * @returns
   */
  public updateData = async (name: string, query: any, update: object) => {
    try {
      this._checkModel(name);
      const result = await this._getModel(name).update(update, query);
      return result;
    } catch (error) {
      console.log("Error while to updateData: \n", error);
      return null;
    }
  };

  /**
   * this helper is use to remove  data field in a collection of postgresdb
   * @param name
   * @param deleteObj
   * @returns
   */
  public deleteData = async (name: string, query: any) => {
    try {
      this._checkModel(name);
      const result = await this._getModel(name).destroy({ where: query });
      return result;
    } catch (error) {
      console.log("Error while to deleteData: \n", error);
      return null;
    }
  };

  _checkModel = (model: string) => {
    if (!Object.keys(DATA_MODELS).includes(model))
      throw new Error("Model is not defined.");
  };

  /**
   * this helper is use to remove  data field in a collection of postgresdb
   * @param modelName
   * @param whereClause
   * @param attributes
   * @param include
   * @param options
   * @returns
   */
  public findDataFromJoinModels = async (
    modelName: string,
    whereClause: any,
    attributes: any[],
    include: any[],
    options: any
  ) => {
    try {
      this._checkModel(modelName);
      const result = await this._getModel(modelName).findAll({
        where: whereClause,
        attributes: attributes,
        include: include,
        limit: options.limit,
        offset: options.offset,
        order: options.order,
      });
      return result;
    } catch (error) {
      console.log(
        "Error while to findDataOfSelectedColumnsofDiffModels: \n",
        error
      );
      return null;
    }
  };

  // get the selected moongose model
  _getModel = (model: string): any => {
    switch (model) {
         case DATA_MODELS.User:
            return User;
         case DATA_MODELS.Node:
            return Node;
          case DATA_MODELS.Plans:
             return Plans;
             case DATA_MODELS.Subscriptions:
              return Subscriptions;
      default:
        return null;
    }
  };
}

export default PostgresDataHelper.getInstance();
