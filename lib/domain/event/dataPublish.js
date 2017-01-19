'use strict';
const constant = require('../util/constant');

class Event {
    constructor({name = constant.EVENT.DATA_PUBLISH_NAME, timestamp, dataSource, value}) {
        this._name = name;
        this._timestamp = timestamp;
        this._dataSource = dataSource;
        this._value = value;
    }

    get name() {
        return this._name;
    }

    get timestamp() {
        return this._timestamp;
    }

    get dataSource() {
        return this._dataSource;
    }

    get value() {
        return this._value;
    }

}

module.exports = Event;