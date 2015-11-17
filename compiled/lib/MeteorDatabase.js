///<reference path="../../typings/node-mysql-wrapper/node-mysql-wrapper.d.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var node_mysql_wrapper_1 = require("node-mysql-wrapper");
var Collection_1 = require("./Collection");
var MeteorDatabase = (function (_super) {
    __extends(MeteorDatabase, _super);
    function MeteorDatabase(connection) {
        _super.call(this, connection);
    }
    MeteorDatabase.prototype.meteorCollection = function (tableOrTableName, collectionName, fillWithCriteria) {
        var _table;
        if (node_mysql_wrapper_1.Helper.isString(tableOrTableName)) {
            _table = this.table(tableOrTableName);
        }
        else if (_table instanceof node_mysql_wrapper_1.Table) {
            _table = tableOrTableName;
        }
        var col = new Collection_1.default(_table, collectionName);
        col.fill(fillWithCriteria);
        return col;
    };
    return MeteorDatabase;
})(node_mysql_wrapper_1.Database);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MeteorDatabase;
