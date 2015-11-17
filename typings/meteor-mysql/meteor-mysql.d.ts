// Type definitions for meteor-mysql
// Project: https://github.com/nodets/meteor-mysql
// Definitions by: Makis Maropoulos <https://github.com/kataras>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

/// <reference path="../node-mysql-wrapper/node-mysql-wrapper.d.ts"/>
///<reference path='../my-meteor/my-meteor.d.ts' />
declare module "meteor-mysql"{
  export = Mysql;
}

declare module Mysql{

  export class MeteorDatabase extends Database{

    constructor(connection?: Connection);

    meteorCollection<T>(tableOrTableName: string | Table<T>, collectionName: string, fillWithCriteria?: any): Collection<T>;
  }

  export class Collection<T> {

      constructor(table?: Table<T>, name?: string);

      rawCollection(): any;

      rawDatabase(): any;

      _ensureIndex(indexName: string, options?: { [key: string]: any }): void;

      allow(options: {
          insert?: (userId: string, doc: T) => boolean;
          update?: (userId: string, doc: T, fieldNames: string[], modifier: any) => boolean;
          remove?: (userId: string, doc: T) => boolean;
          fetch?: string[];
          transform?: Function;
      }): boolean;

      deny(options: {
          insert?: (userId: string, doc: T) => boolean;
          update?: (userId: string, doc: T, fieldNames: string[], modifier: any) => boolean;
          remove?: (userId: string, doc: T) => boolean;
          fetch?: string[];
          transform?: Function;
      }): boolean;


      fill(criteriaRawJsObject: any): MeteorMysqlCollection<T>;

      fillAll(): MeteorMysqlCollection<T>;

      fillOne(criteriaRawJsObject: any): MeteorMysqlCollection<T>;

      find(selector?: any, options?: {
          sort?: any;
          skip?: number;
          limit?: number;
          fields?: any;
          reactive?: boolean;
          transform?: Function;
      }): Mongo.Cursor<T>;


      findOne(selector?: any, options?: {
          sort?: any;
          skip?: number;
          fields?: any;
          reactive?: boolean;
          transform?: Function;
      }): T;

      insert(doc: T, callback?: Function): string;

      remove(selector: any, callback?: Function): void;

      update(selector: any, modifier?: any, options?: {
          multi?: boolean;
          upsert?: boolean;
      }, callback?: Function): number;


  }

  export function connect(mysqlUrlOrObjectOrMysqlAlreadyConnection: Mysql.IConnection | string, ...useTables: any[]): NodeMysqlWrapper.Database;

}
