import { Table, TableToSearchPart } from "node-mysql-wrapper";
declare class LiveHelper {
    static canInsert(objRow: any, rawCriteria: any, joinedRow?: any): boolean;
    static listenToTable(table: Table<any>, collectionArray: Array<any>, criteriaRawJsObject: any, action: (evt: string, tablePart: TableToSearchPart, objRow: any, selector: any, isArray: boolean) => void): void;
}
export default LiveHelper;
