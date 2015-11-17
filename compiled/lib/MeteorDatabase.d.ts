/// <reference path="../../typings/node-mysql-wrapper/node-mysql-wrapper.d.ts" />
import { Database, Table, Connection } from "node-mysql-wrapper";
import Collection from "./Collection";
export default class MeteorDatabase extends Database {
    constructor(connection?: Connection);
    meteorCollection<T>(tableOrTableName: string | Table<T>, collectionName: string, fillWithCriteria?: any): Collection<T>;
}
