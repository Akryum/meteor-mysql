/// <reference path="../typings/mysql/mysql.d.ts" />
/// <reference path="../typings/node-mysql-wrapper/node-mysql-wrapper.d.ts" />
/// <reference path="../typings/my-meteor/my-meteor.d.ts" />
import MeteorDatabase from "./lib/MeteorDatabase";
export declare function connect(mysqlUrlOrObjectOrMysqlAlreadyConnection: Mysql.IConnection | string, ...useTables: any[]): MeteorDatabase;
