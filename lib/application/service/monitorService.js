'use strict';
const _ = require('underscore');
const co = require('co');
const {createMonitorService, DataPoint, constant} = require('../../domain');
const {logger} = require('../../util');
const {createMonitorRepository, createMessageProducer} = require('../../infrastructure');

class Service {
    constructor() {
        this._monitorRepository = createMonitorRepository();
        this._messageProducer = createMessageProducer();
    }

    registerMonitor(dataSourceData, traceContext, callback) {
        if (!dataSourceData || !dataSourceData.id) {
            callback(null, false);
            return;
        }
        let self = this;

        function getMonitorFromRepository(monitorID) {
            return new Promise((resolve, reject)=> {
                self._monitorRepository.getMonitorByID(monitorID, traceContext, (err, monitor)=> {
                    if (err) {
                        reject(err);
                    }
                    resolve(monitor);
                });
            });
        }

        function saveMonitor(monitor) {
            return new Promise((resolve, reject)=> {
                self._monitorRepository.save(monitor, traceContext, (err, isSuccess)=> {
                    if (err) {
                        reject(err);
                    }
                    resolve(isSuccess);
                });
            });
        }

        function* registerMonitor() {
            let monitor = yield getMonitorFromRepository(dataSourceData.id);
            if (monitor) {
                return false;
            }
            let monitorService = createMonitorService();
            let newMonitor = monitorService.initMonitor(dataSourceData);
            let isSuccess = yield saveMonitor(newMonitor);
            return isSuccess
        };
        co(registerMonitor).then((isSuccess)=> {
            callback(null, isSuccess);
        }).catch(err=> {
            callback(err);
        });
    }

    monitoringData(originalData, traceContext, callback) {
        if (!originalData || !originalData.s || !originalData.t || !originalData.v) {
            callback(null, false);
            return;
        }

        let self = this;

        this._monitorRepository.getMonitorByID(originalData.s, traceContext, (err, monitor)=> {
            if (err) {
                callback(err);
                return;
            }
            if (!monitor) {
                callback(null, false);
                return;
            }
            monitor.on(constant.EVENT.DATA_PUBLISH, dataPublishEvent=> {
                let {timestamp, dataSource, value}=dataPublishEvent;
                self._messageProducer.produceDataPublishTopicMessage({
                    timestamp,
                    dataSource,
                    value
                }, traceContext, (err, data)=> {
                    if (err) {
                        logger.error(err.message, traceContext);
                    }
                    if (data) {
                        logger.info("produce data publish message success", traceContext);
                    }
                    else {
                        logger.error("produce data publish message fail", traceContext);
                    }
                });
            });
            let {s:dataSource, t:timestamp, v:value} = originalData;
            let dataPoint = new DataPoint({dataSource, timestamp, value});
            let isSuccess = monitor.monitoringData(dataPoint);
            if (isSuccess) {
                monitor.removeAllListeners(constant.EVENT.DATA_PUBLISH);
                self._monitorRepository.save(monitor, traceContext, (err, isSuccess)=> {
                    if (err) {
                        callback(err);
                        return;
                    }
                    callback(null, isSuccess);
                });
            } else {
                monitor.removeAllListeners(constant.EVENT.DATA_PUBLISH);
                callback(null, false);
            }
        });
    }
}

module.exports = Service;