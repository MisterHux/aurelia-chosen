export default class DataItem  {
    constructor(data: any) {
        Object.assign(this, data);
    }
    id: string;
    uniqueName: string;
    hasStatus: boolean;
    description: string;
}