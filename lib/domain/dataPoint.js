'use strict';

class DataPoint {
    constructor({dataSource, timestamp, value}) {
        this._dataSource = dataSource;
        this._timestamp = timestamp;
        this._value = value;
    }

    get dataSource() {
        return this._dataSource;
    }

    get timestamp() {
        return this._timestamp;
    }

    get value() {
        return this._value;
    }
}

module.exports = DataPoint;