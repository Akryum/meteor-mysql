///<reference path="../../typings/node-mysql-wrapper/node-mysql-wrapper.d.ts"/>


import {Database,Table,Helper,Connection} from "node-mysql-wrapper";
import Collection from "./Collection";

export default class MeteorDatabase extends Database{

  constructor(connection?: Connection) {
      super(connection);
  }

  meteorCollection<T>(tableOrTableName: string | Table<T>, collectionName: string, fillWithCriteria?: any): Collection<T> {
      let _table;
      if (Helper.isString(tableOrTableName)) {
          _table = this.table<T>(<string>tableOrTableName);
      } else if (_table instanceof Table) {
          _table = tableOrTableName;
      }

      let col = new Collection<T>(_table, collectionName);
      col.fill(fillWithCriteria);
      return col;
  }
}
