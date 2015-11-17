import {Helper,Table,TABLE_RULES_PROPERTY,TableToSearchPart,ConditionalConverter} from "node-mysql-wrapper";
import LiveHelper from "./LiveHelper";
import {EventEmitter} from 'events';

declare module Meteor {
    var isServer: boolean;
    var isClient: boolean;

    var bindEnvironment: Function;
}

declare var Future;
/* In client side we just use: Users = new Mongo.Collection<T>('nameOfCollection')
 In server side we use:  Users = db.meteorCollection<T>('usersOrTable','nameOfCollection',criteria?); . here we can use Users.find,findOne,insert,update,remove, and custom fillAll,fill,fillOne.*/
class Collection<T> extends EventEmitter {

    private collection: Mongo.Collection<T>;
    /**
     * Last/current raw criteria used to fill this collection.
     * fill, and fillOne.
     */
    private criteriaRawJsObject: any;
    private debug: boolean = false;

    constructor(public table?: Table<T>, public name?: string) {
        super();
        if (!name) {
            name = table.name;
        }
        if (Meteor) {
            Future = require("fibers/future");
        }

        this.collection = new Mongo.Collection<T>(name, { connection: null }); //no save to mongodb of course...
        this.startListeningToDatabase();

    }

    startListeningToDatabase(): void {

        // listens to table's direct database events.
        this.table.on("INSERT", Meteor.bindEnvironment((rows: any[]) => {
            rows.forEach(row=> {
                let objRow = this.table.objectFromRow(row);
                let canInsert = LiveHelper.canInsert(objRow, this.criteriaRawJsObject);
                if (canInsert) {
                    let _newPureItem = this.proccessJoinedTableInsert(objRow); //edw pernei to object, me ta joins ktlp
                    this.collection.insert(_newPureItem);
                    this.emit('INSERT', _newPureItem);
                }

            });
        }));

        this.table.on("UPDATE", Meteor.bindEnvironment((rows: any[]) => {

            rows.forEach(row => {
                let rowUpdated = row["after"];
                let criteriaExistingItem = {};
                criteriaExistingItem[Helper.toObjectProperty(this.table.primaryKey)] = rowUpdated[this.table.primaryKey];

                //  let objRow = this.table.objectFromRow(rowUpdated);
                //update 24-10-2105:
                let objRow = this.proccessJoinedTableInsert(this.table.objectFromRow(rowUpdated));
                // this.collection.update(criteriaExistingItem, objRow);
                this.collection.update(criteriaExistingItem, objRow);
                this.emit('UPDATE', objRow);
            });
        }));

        this.table.on("DELETE", Meteor.bindEnvironment((rows: any[]) => {
            rows.forEach(row=> {
                let toBeRemovedCriteria = {};
                toBeRemovedCriteria[Helper.toObjectProperty(this.table.primaryKey)] = row[this.table.primaryKey];
                this.collection.remove(toBeRemovedCriteria);
                this.emit("DELETE", toBeRemovedCriteria);
            });

        }));
    }




    rawCollection(): any {/** TODO: add return value **/
        return this.collection.rawCollection();
    }

    rawDatabase(): any {/** TODO: add return value **/
        return this.collection.rawDatabase();
    }

    get _collection(): Mongo.Collection<T> {
        return this.collection;
    }

    _ensureIndex(indexName: string, options?: { [key: string]: any }): void {
        return this.collection._ensureIndex(indexName, options);
    }

    allow(options: {
        insert?: (userId: string, doc: T) => boolean;
        update?: (userId: string, doc: T, fieldNames: string[], modifier: any) => boolean;
        remove?: (userId: string, doc: T) => boolean;
        fetch?: string[];
        transform?: Function;
    }): boolean {
        return this.collection.allow(options);
    }

    deny(options: {
        insert?: (userId: string, doc: T) => boolean;
        update?: (userId: string, doc: T, fieldNames: string[], modifier: any) => boolean;
        remove?: (userId: string, doc: T) => boolean;
        fetch?: string[];
        transform?: Function;
    }): boolean {
        return this.collection.deny(options);
    }

    private proccessJoinedTableInsert(objRow: any): any {
        let future = new Future;
        let newCriteriaForOneObject: any = {};

        //  var BreakException = {};
        if (this.criteriaRawJsObject !== undefined) {
            // try {
            //vazoume  to Id gia na vrei ta joined se auto to single object.
            let primaryKeyOfObjValue = objRow[Helper.toObjectProperty(this.table.primaryKey)];
            newCriteriaForOneObject[Helper.toObjectProperty(this.table.primaryKey)] = primaryKeyOfObjValue;

            Helper.forEachKey(this.criteriaRawJsObject, key=> {
                if (objRow[key] === undefined) { //an sto  object row pou ir9e apto db event den uparxei auto to property
                    let joinedTable = this.criteriaRawJsObject[key];
                    if (Helper.hasRules(joinedTable) && joinedTable[TABLE_RULES_PROPERTY]["table"] !== undefined) { //kai auto to key exei table rules, ara einai property joined table.
                        //AT LEAST ONE JOINED TABLE, THEN WE WILL MAKE A FIND FROM TABLE TO FETCH ALL POSSIBLE JOINED TABLES, MAKE OBJROW = TO THE RESULT.

                        newCriteriaForOneObject[key] = joinedTable; //Eg: author = { userId: '= authorId',
                        // tableRules: { table: 'users', limit: 1, limitStart: 1, limitEnd: 1 } }


                    }
                }

            });

            this.table.findSingle(newCriteriaForOneObject).then((_result) => {
                future.return(_result);
            });
            /*  } catch (e) {
             if (e !== BreakException) { throw e;} //an dn einai error gia break to loop tote emfanise to aliws upo9etoume oti vrike estw ena joined table.

             let primaryKeyOfObj = objRow[Helper.toRowProperty(this.table.primaryKey)];

             }*/

        } else {
            future.return(objRow);

        }


        return future.wait();
    }

    private listenToJoinedTables(): void {

        LiveHelper.listenToTable(this.table, this.collection.find().fetch(), this.criteriaRawJsObject, Meteor.bindEnvironment((event, tablePart: TableToSearchPart, objRow, selector, isArray) => {


            if (event === "INSERT") {
                if (isArray) {
                    //array push
                    let toPushArrayObj = {};
                    toPushArrayObj["$push"] = {};
                    toPushArrayObj["$push"][tablePart.propertyName] = objRow;
                    let updateResult = this.collection.update(selector, toPushArrayObj, { multi: false, upsert: false }, (err, res) => {
                    });
                } else {
                    //obj set
                    let toSetObj = {};
                    toSetObj["$set"] = {};
                    toSetObj["$set"][tablePart.propertyName] = objRow;
                    this.collection.update(selector, toSetObj);
                }
            } else if (event === "DELETE" || event === "UPDATE") {

                let toRemoveOrSetObj: any = {};

                if (event === "DELETE") {
                    //24-10-2015 kai logika kai edw 9a 9eeli $unset gia objects ,kai $Pull opws exw gia listes... ara na to kanw na to pernw apto isArray
                    toRemoveOrSetObj["$pull"] = {};
                    toRemoveOrSetObj["$pull"]["" + tablePart.propertyName + ""] = selector;
                } else {
                    //UPDATE
                    //auto doulevei se arrays( user->stories)
                    /*
                    toRemoveOrSetObj["$set"] = {};
                    toRemoveOrSetObj["$set"]["" + tablePart.propertyName + ".$"] = objRow;
                    */
                    //kai auto se objects (story->author) mono ena .$ diaferoun
                    toRemoveOrSetObj["$set"] = {};
                    toRemoveOrSetObj["$set"][""+tablePart.propertyName + (isArray? ".$":"")] = objRow;
                    //console.log('toRemovedOrSetObj: ',toRemoveOrSetObj);
                }


                //edw gia na vrw to {userId:18} apto authorId: '= userId' tou tableRules px.

                /*    let joinedCriteria = this.criteriaRawJsObject[tablePart.propertyName];
                    let selectorForParent = {};
                    Helper.forEachKey(joinedCriteria, _key=> {
                        if (joinedCriteria[_key] === "= " + Helper.toObjectProperty(this.table.primaryKey)) { //authorId: '= userId'
                            selectorForParent[Helper.toObjectProperty(this.table.primaryKey)] = objRow[_key]; //{userId:18}

                            if (event === "UPDATE") {
                                //UPDATE


                                //     secondSelector = tablePart.propertyName + "." + _key + ": " + objRow[_key];// myStories.authorId : 18
                                selectorForParent = {};
                             //   selectorForParent[tablePart.propertyName + "." + _key] = objRow[_key]; // myStories.authorId : 18 alla isws dn xreiazete auto

                            }
                        }
                    });*/
                //to allaksa se auto p einai : myStories.storyId:2 den xreiazete na vrw to myStories.authorId:18 kai meta na to kanw delete i update, efoson kserw to id to pernw me tin mia sto parentSelector
                let selectorForParent = {};
                let joinedTable = this.table.connection.table(tablePart.tableName);
                selectorForParent[tablePart.propertyName + "." + Helper.toObjectProperty(joinedTable.primaryKey)] = objRow[Helper.toObjectProperty(joinedTable.primaryKey)];

                let res = this.collection.update(selectorForParent, toRemoveOrSetObj,{ multi: true, upsert: false });//24-10-2015 change { multi: false, upsert: true });
            }

        }));

    }

    fill(criteriaRawJsObject: any = {}): Collection<T> {
        let future = new Future;
        this.criteriaRawJsObject = criteriaRawJsObject;
        this.table.find(criteriaRawJsObject).then(Meteor.bindEnvironment((results: T[]) => {
            results.forEach(result=> {
                this.collection.insert(result);
            });
            this.listenToJoinedTables();
            future.return(this);
        }));


        return future.wait();
    }

    fillAll(): Collection<T> {
        let future = new Future;

        this.table.findAll().then(Meteor.bindEnvironment((results: T[]) => {
            results.forEach(result=> {
                this.collection.insert(result);
            });

            future.return(this);
        }));

        return future.wait();
    }

    fillOne(criteriaRawJsObject: any): Collection<T> {
        let future = new Future;
        this.criteriaRawJsObject = criteriaRawJsObject;
        this.table.findSingle(criteriaRawJsObject).then(Meteor.bindEnvironment((result: T) => {
            this.collection.insert(result);
            future.return(this);
        }));

        return future.wait();
    }

    find(selector?: any, options?: {
        sort?: any;
        skip?: number;
        limit?: number;
        fields?: any;
        reactive?: boolean;
        transform?: Function;
    }): Mongo.Cursor<T> {
        return this.collection.find(selector ? selector : {}, options ? options : {});
    }


    findOne(selector?: any, options?: {
        sort?: any;
        skip?: number;
        fields?: any;
        reactive?: boolean;
        transform?: Function;
    }): T {
        return this.collection.findOne(selector ? selector : {}, options ? options : {});
    }

    insert(doc: T, callback?: Function): string {
        let future = new Future;

        this.table.save(doc).then(Meteor.bindEnvironment((res) => {
            let _primarykey = res[Helper.toObjectProperty(this.table.primaryKey)];
            if (callback !== undefined) {
                callback(_primarykey);
            }
            future.return(_primarykey); //return the new id

        }));

        return future.wait();
    }

    remove(selector: any, callback?: Function): void {
        let future = new Future;

        this.table.remove(selector).then(Meteor.bindEnvironment((res) => {
            if (callback !== undefined) {
                callback(res);
            }
            future.return(res);
        }));


        return future.wait();
    }

    update(selector: any, modifier?: any, options?: {
        multi?: boolean;
        upsert?: boolean;
    }, callback?: Function): number { //1 for success -1 for fail
        let future = new Future;

        this.table.save(selector).then(Meteor.bindEnvironment((res) => {
            if (callback !== undefined) {
                callback(1);
            }
            future.return(1);
        }, (err: any) => {
            if (callback !== undefined) {
                callback(-1);
            }
            future.return(-1);
        }));

        return future.wait();
    }
}

export default Collection;
