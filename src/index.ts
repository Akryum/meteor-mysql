///<reference path="../typings/mysql/mysql.d.ts"/>
///<reference path="../typings/node-mysql-wrapper/node-mysql-wrapper.d.ts"/>
///<reference path="../typings/my-meteor/my-meteor.d.ts"/>
import {Connection} from "node-mysql-wrapper";
import MeteorDatabase from "./lib/MeteorDatabase";
import Collection from "./lib/Collection";
declare var Future;

export function connect(mysqlUrlOrObjectOrMysqlAlreadyConnection: Mysql.IConnection | string, ...useTables: any[]): MeteorDatabase {
    if (Meteor) {
        Future = require("fibers/future");
    }
    let future = new Future;
    let mysqlCon = new Connection(mysqlUrlOrObjectOrMysqlAlreadyConnection);
    let mysqlDatabase = new MeteorDatabase(mysqlCon);

    if (useTables && useTables !== null) {
        mysqlDatabase.useOnly(useTables);
    }
    mysqlDatabase.ready(function() {
        //here the db is ready);
        future.return(mysqlDatabase);
    });
    //I must do it sync code and after return the database object.


    // return mysqlDatabase;
    return future.wait();
}

exports.default = Collection;
exports.Collection = Collection;
