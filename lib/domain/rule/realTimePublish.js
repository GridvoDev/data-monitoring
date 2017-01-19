'use strict';
const constant = require('../util/constant');
const {DataPublishEvent} = require('../event');

class Rule {
    constructor({publishSpace = constant.RULE.REAL_TIME_PUBLISH_SPACE, isOpen = true}) {
        this._id = constant.RULE.REAL_TIME_PUBLISH_RULE_ID;
        this._name = constant.RULE.REAL_TIME_PUBLISH_RULE_NAME;
        this._publishSpace = publishSpace;
        this._isOpen = isOpen;
    }

    get id() {
        return this._id;
    }

    get name() {
        return this._name;
    }

    get publishSpace() {
        return this._publishSpace;
    }

    set publishSpace(value) {
        this._publishSpace = value;
    }

    get isOpen() {
        return this._isOpen;
    }

    set isOpen(value) {
        this._isOpen = value;
    }

    eventMatching(monitoringItems, dataPoint) {
        if (!this._isOpen) {
            return null;
        }
        let {lastPublishTimestamp} = monitoringItems;
        if (!lastPublishTimestamp) {
            return null;
        }
        let timeSpace = dataPoint.timestamp - lastPublishTimestamp;
        if (timeSpace >= this._publishSpace) {
            let {timestamp, dataSource, value} = dataPoint;
            monitoringItems.lastPublishTimestamp = timestamp;
            return new DataPublishEvent({timestamp, dataSource, value});
        }
        return null;
    }

}

module.exports = Rule;