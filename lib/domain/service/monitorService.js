'use strict';
const _ = require('underscore');
const Monitor = require('../monitor');
const constant = require('../util/constant');
const {RealTimePublishRule} = require('../rule');

class Service {
    initMonitor(dataSourceData) {
        let {id:monitorID, dataType} = dataSourceData;
        let monitoringItems = {};
        let rules = {};
        let realTimePublishRule = new RealTimePublishRule({});

        function realTimePublishSupport() {
            monitoringItems.lastPublishTimestamp = 1;
            rules[realTimePublishRule.id] = realTimePublishRule;
        }

        switch (dataType) {
            case constant.DATATYPE.YL :
                realTimePublishSupport();
                return new Monitor({monitorID, dataType, monitoringItems, rules});
            case constant.DATATYPE.SW :
                realTimePublishSupport();
                return new Monitor({monitorID, dataType, monitoringItems, rules});
            default:
                return null;
        }
    }

    loadMonitor(monitorData) {
        let {monitorID, dataType, rules, monitoringItems}=monitorData;
        let ruleKeys = _.keys(rules);
        for (let key of ruleKeys) {
            switch (key) {
                case constant.RULE.REAL_TIME_PUBLISH_RULE_ID:
                    let {id, name, publishSpace, isOpen} = rules[key];
                    let realTimePublishRule = new RealTimePublishRule({id, name, publishSpace, isOpen});
                    rules[key] = realTimePublishRule;
                    continue;
                default:
                    continue;
            }
        }
        return new Monitor({monitorID, dataType, monitoringItems, rules});
    }
}

module.exports = Service;