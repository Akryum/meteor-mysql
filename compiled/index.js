///<reference path="../typings/mysql/mysql.d.ts"/>
///<reference path="../typings/node-mysql-wrapper/node-mysql-wrapper.d.ts"/>
///<reference path="../typings/my-meteor/my-meteor.d.ts"/>
var node_mysql_wrapper_1 = require("node-mysql-wrapper");
var MeteorDatabase_1 = require("./lib/MeteorDatabase");
var Collection_1 = require("./lib/Collection");
function connect(mysqlUrlOrObjectOrMysqlAlreadyConnection) {
    var useTables = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        useTables[_i - 1] = arguments[_i];
    }
    if (Meteor) {
        Future = require("fibers/future");
    }
    var future = new Future;
    var mysqlCon = new node_mysql_wrapper_1.Connection(mysqlUrlOrObjectOrMysqlAlreadyConnection);
    var mysqlDatabase = new MeteorDatabase_1.default(mysqlCon);
    if (useTables && useTables !== null) {
        mysqlDatabase.useOnly(useTables);
    }
    mysqlDatabase.ready(function () {
        future.return(mysqlDatabase);
    });
    return future.wait();
}
exports.connect = connect;
exports.default = Collection_1.default;
exports.Collection = Collection_1.default;
