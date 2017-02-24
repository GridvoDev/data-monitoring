'use strict';
const {KafkaZipkinMessageConsumer, kafkaWithZipkinTraceContextFeach} = require('gridvo-common-js');
const {tracer} = require('../util');
const {createMonitorService} = require('../application');
const {logger} = require('../util');

class Consumer {
    constructor(serviceName = "data-monitoring") {
        this._consumer = new KafkaZipkinMessageConsumer({tracer, serviceName});
        this._monitorService = createMonitorService();
    }

    startConsume() {
        let topics = [{
            topic: "data-arrive"
        }, {
            topic: "data-source-added"
        }, {
            topic: "data-source-deleted"
        }];
        let self = this;
        this._consumer.consumeMessage(topics, (err, message) => {
            if (err) {
                logger.error(err.message);
                return;
            }
            let data = JSON.parse(message.value);
            let traceContext = kafkaWithZipkinTraceContextFeach(data);
            switch (message.topic) {
                case "data-source-added":
                    delete data.zipkinTrace;
                    let dataSourceData = data;
                    self._monitorService.registerMonitor(dataSourceData, traceContext, (err, isSuccess) => {
                        if (err) {
                            logger.error(err.message, traceContext);
                            return;
                        }
                        if (isSuccess) {
                            logger.info(`register "${dataSourceData.id}" monitor success`, traceContext);
                        } else {
                            logger.error(`register "${dataSourceData.id}" monitor fail`, traceContext);
                        }
                    });
                    return;
                case "data-source-deleted":
                    delete data.zipkinTrace;
                    let monitorID = data.dataSourceID;
                    self._monitorService.removeMonitor(monitorID, traceContext, (err, isSuccess) => {
                        if (err) {
                            logger.error(err.message, traceContext);
                            return;
                        }
                        if (isSuccess) {
                            logger.info(`remove "${monitorID}" monitor success`, traceContext);
                        } else {
                            logger.error(`remove "${monitorID}" monitor fail`, traceContext);
                        }
                    });
                    return;
                case "data-arrive":
                    delete data.zipkinTrace;
                    let originalData = data;
                    self._monitorService.monitoringData(originalData, traceContext, (err, isSuccess) => {
                        if (err) {
                            logger.error(err.message, traceContext);
                            return;
                        }
                        if (isSuccess) {
                            logger.info(`monitoring "${originalData.s}" data success`, traceContext);
                        } else {
                            logger.error(`monitoring "${originalData.s}" data fail`, traceContext);
                        }
                    });
                    return;
                default:
                    logger.error(`unknow topic "${message.topic}"`, traceContext);
                    return;
            }
        });
    }

    stopConsume(callback) {
        this._consumer.close(callback);
    }
}

module.exports = Consumer;
