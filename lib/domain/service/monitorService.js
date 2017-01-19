'use strict';
const _ = require('underscore');
const Monitor = require('../monitor');
const constant = require('../util/constant');
const {RealTimePublishRule} = require('../rule');

class Service {
    initMonitor(dataSourceData) {
        let {id} = dataSourceData;
        let dataType = id.split("-")[1];
        let monitoringItems = {};
        let rules = {};
        let realTimePublishRule = new RealTimePublishRule({});

        function realTimePublishSupport() {
            monitoringItems.lastPublishTimestamp = 1;
            rules[realTimePublishRule.id] = realTimePublishRule;
        }

        switch (dataType) {
            case constant.DATATYPE.RAIN :
                realTimePublishSupport();
                return new Monitor({id, dataType, monitoringItems, rules});
            case constant.DATATYPE.WATERLEVEL :
                realTimePublishSupport();
                return new Monitor({id, dataType, monitoringItems, rules});
            default:
                return null;
        }
    }

    loadMonitor(monitorData) {
        let {id, dataType, rules, monitoringItems}=monitorData;
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
        return new Monitor({id, dataType, monitoringItems, rules});
    }
}

module.exports = Service;