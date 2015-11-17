import { Table } from "node-mysql-wrapper";
import { EventEmitter } from 'events';
declare class Collection<T> extends EventEmitter {
    table: Table<T>;
    name: string;
    private collection;
    private criteriaRawJsObject;
    private debug;
    constructor(table?: Table<T>, name?: string);
    startListeningToDatabase(): void;
    rawCollection(): any;
    rawDatabase(): any;
    _collection: Mongo.Collection<T>;
    _ensureIndex(indexName: string, options?: {
        [key: string]: any;
    }): void;
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
    private proccessJoinedTableInsert(objRow);
    private listenToJoinedTables();
    fill(criteriaRawJsObject?: any): Collection<T>;
    fillAll(): Collection<T>;
    fillOne(criteriaRawJsObject: any): Collection<T>;
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
export default Collection;
