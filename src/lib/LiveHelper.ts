import {Helper,Table,TableToSearchPart,ConditionalConverter} from "node-mysql-wrapper";

class LiveHelper {

    static canInsert(objRow: any, rawCriteria, joinedRow?: any): boolean {
        let canInsert = true;
        //prin to eisagw stin lista prepei na elenksw an anoikei stin lista, vasi tou criteria pou egine fill h collection.
        Helper.forEachKey(rawCriteria, key=> {
            if (!canInsert) {
                return;
            }
            try {
                if (objRow[key] !== undefined) {
                    ///edw elenxw to IN (value1,value2,value3).
                    let _valCriteria = rawCriteria[key];
                    let _valSplited = _valCriteria.split(" "); //einai split otan exei '= 16' px alla an einai userId:16 tote ti ginete, boulovitch ?

                    if (_valSplited[0] === "IN(") {
                        //convert IN to multi || statements.

                        let _values = _valCriteria.substring(_valSplited[0].length, _valCriteria.lastIndexOf(")")).split(","); //except the last ) and whitespaces (?)

                        _values = " " + objRow[key] + " === " + _values.join("|| " + objRow[key] + " === ");
                        if (!eval(_values)) {
                            canInsert = false;
                        }
                    } else {

                        let _symbolCombarison = ConditionalConverter.toJS(_valSplited[0]);
                        let valComparison = _valSplited[1];
                        let ifEvalStatementStr = objRow[key] + _symbolCombarison + valComparison;//Eg. key: yearsOld,rawCriteria[key]: ' >=16'
                        ifEvalStatementStr = ConditionalConverter.toJSConditional(ifEvalStatementStr);
                        if (!eval(ifEvalStatementStr)) {
                            canInsert = false;
                        }


                    }
                }
            } catch (ex) {
                canInsert = false; //maybe will remove it if bug occurs.
            }
        });

        return canInsert;
    }


    /**
     * ///TODO: FUTURE-> event: "INSERT" || "UPDATE" || "DELETE"
     * table: The Table object
     * collectionArray: The collection which is checking if can...
     * action:action when can...
     */
    static listenToTable(table: Table<any>, collectionArray: Array<any>, criteriaRawJsObject: any,
        action: (evt: string, tablePart: TableToSearchPart, objRow: any, selector: any, isArray: boolean) => void): void {

        let criteria = table.criteriaDivider.divide(criteriaRawJsObject);

        criteria.tables.forEach(_tb=> {
            let joinedTableObj = table.connection.table(_tb.tableName);
            //edw pernw ta criteria gia to joined table.
            let joinedTableCriteria = joinedTableObj.criteriaDivider.divide(criteria.rawCriteriaObject[_tb.propertyName]);

            joinedTableObj.on("INSERT", (rows: any[]) => {
                rows.forEach(row=> {
                    let objRow = joinedTableObj.objectFromRow(row);
                    collectionArray.forEach(_objInlist=> {
                        let joinedCriteria = {};
                        Helper.forEachKey(joinedTableCriteria.rawCriteriaObject, key=> {
                            try {
                                let valWithoutComparison = joinedTableCriteria.rawCriteriaObject[key].split(" ")[1]; //0 = comparison:= ,1: userId
                                let valComparisonSymbol = joinedTableCriteria.rawCriteriaObject[key].split(" ")[0];

                                if (_objInlist[valWithoutComparison] !== undefined) {
                                    joinedCriteria[key] = valComparisonSymbol + " " + _objInlist[valWithoutComparison];
                                }
                            } catch (ex) {
                                //edw ginete catch an to key einai object kai den exei to split method, dld einai eite to table rules eite alla joined tables mesa se auto to joined tables, auto sto mellon 9a to diaxiristw.
                            }
                        });
                        let canInsert = LiveHelper.canInsert(objRow, joinedCriteria);
                        if (canInsert) {
                            let parentPropName = _tb.propertyName;

                            let primkey = Helper.toObjectProperty(table.primaryKey);
                            let objToFind = {};
                            objToFind[primkey] = _objInlist[primkey];
                            if (_objInlist[parentPropName] instanceof Array) {
                                _objInlist[parentPropName].push(objRow);
                                action("INSERT", _tb, objRow, objToFind, true);

                            } else {
                                action("INSERT", _tb, objRow, objToFind, false);
                            }
                        }
                    });
                });
            });

            joinedTableObj.on("DELETE", (rows: any[]) => {
                rows.forEach(row=> {
                    let objRow = joinedTableObj.objectFromRow(row);
                    let toBeRemovedCriteria = {};
                    toBeRemovedCriteria[Helper.toObjectProperty(joinedTableObj.primaryKey)] = row[joinedTableObj.primaryKey];
                    //vasika malakies isws kanw, isws einai h  idia akrivws diadikasia me to insert adi gia $push 9a kanw $pull.

                    // selector[table.primaryKey]
                    let isArray = false;
                    if (joinedTableCriteria === undefined || joinedTableCriteria.queryRules === undefined ||
                        (joinedTableCriteria.queryRules !== undefined && ((joinedTableCriteria.queryRules.limitEnd - joinedTableCriteria.queryRules.limitStart) !== 1))) {
                        isArray = true;
                        // console.log('is array on update');
                    }
                    action("DELETE", _tb, objRow, toBeRemovedCriteria, isArray);

                });
            });

            joinedTableObj.on("UPDATE", (rows: any[]) => {

                rows.forEach(row => {
                    let rowUpdated = row["after"];
                    let objRow = joinedTableObj.objectFromRow(rowUpdated);
                    let toBeUpdatedCriteria = {};
                    toBeUpdatedCriteria[Helper.toObjectProperty(joinedTableObj.primaryKey)] = row[joinedTableObj.primaryKey];
                    let isArray = false;
                    if (joinedTableCriteria === undefined || joinedTableCriteria.queryRules === undefined ||
                        (joinedTableCriteria.queryRules !== undefined && ((joinedTableCriteria.queryRules.limitEnd - joinedTableCriteria.queryRules.limitStart) !== 1))) {
                        isArray = true;
                        // console.log('is array on update');
                    }
                    action("UPDATE", _tb, objRow, toBeUpdatedCriteria, isArray);

                });
            });

        });
    }
}

export default LiveHelper;
