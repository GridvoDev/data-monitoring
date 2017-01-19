'use strict';
const _ = require('underscore');
const {createMongoZipkinClient} = require('gridvo-common-js');
const {createMonitorService, constant} = require('../../domain');
const {tracer} = require('../../util');

class Repository {
    constructor() {
        this._dbName = "DataMonitoring";
        this._collectionName = "Monitor";
        this._serviceName = "data-monitoring";
    }

    save(monitor, traceContext, callback) {
        let mongoClient = createMongoZipkinClient({
            tracer,
            traceContext,
            dbName: this._dbName,
            collectionName: this._collectionName,
            serviceName: this._serviceName
        });
        mongoClient.then(({db, collection})=> {
            let {id, dataType, rules, monitoringItems}=monitor;
            let ruleKeys = _.keys(rules);
            for (let key of ruleKeys) {
                switch (key) {
                    case constant.RULE.REAL_TIME_PUBLISH_RULE_ID:
                        let {id, name, publishSpace, isOpen} = rules[key];
                        rules[key] = {id, name, publishSpace, isOpen};
                        continue;
                    default:
                        continue;
                }
            }
            let updateOperations = {
                dataType,
                rules,
                monitoringItems
            };
            collection.updateOne({
                    id
                },
                {
                    $set: updateOperations
                },
                {
                    upsert: true
                },
                (err, result)=> {
                    if (err) {
                        callback(err);
                        db.close();
                        return;
                    }
                    if (result.result.n == 1) {
                        callback(null, true);
                    }
                    else {
                        callback(null, false);
                    }
                    db.close();
                });
        }).catch(err=> {
            callback(err);
        });
    }

    getMonitorByID(id, traceContext, callback) {
        let mongoClient = createMongoZipkinClient({
            tracer,
            traceContext,
            dbName: this._dbName,
            collectionName: this._collectionName,
            serviceName: this._serviceName
        });
        mongoClient.then(({db, collection})=> {
            collection.findOne({id}, {limit: 1}, (err, document)=> {
                    if (err) {
                        callback(err, null);
                        db.close();
                        return;
                    }
                    if (_.isNull(document)) {
                        callback(null, null);
                        db.close();
                        return;
                    }
                    let monitor = createMonitorService().loadMonitor(document);
                    callback(null, monitor);
                    db.close();
                }
            );
        }).catch(err=> {
            callback(err);
        });
    }
}

module.exports = Repository;