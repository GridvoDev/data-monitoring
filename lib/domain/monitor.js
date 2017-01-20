'use strict';
const EventEmitter = require('events');
const _ = require('underscore');

class Monitor extends EventEmitter {
    constructor({monitorID, dataType, monitoringItems, rules}) {
        super();
        this._id = monitorID;
        this._dataType = dataType;
        this._monitoringItems = monitoringItems;
        this._rules = rules;
    }

    get monitorID() {
        return this._id;
    }

    get dataType() {
        return this._dataType;
    }

    get rules() {
        return this._rules;
    }

    get monitoringItems() {
        return this._monitoringItems;
    }

    monitoringData(dataPoint) {
        if (this._id != dataPoint.dataSource) {
            return false;
        }
        let rules = _.values(this._rules);
        for (let rule of rules) {
            let event = rule.eventMatching(this._monitoringItems, dataPoint);
            if (event) {
                this.emit(event.name, event);
            }
        }
        return true;
    }
}

module.exports = Monitor;