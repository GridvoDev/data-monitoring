'use strict';
const kafka = require('kafka-node');
const _ = require('underscore');
const co = require('co');
const should = require('should');
const muk = require('muk');
const MessageConsumer = require('../../lib/kafka/messageConsumer');

describe('messageConsumer() use case test', () => {
    let messageConsumer;
    let client;
    let producer;
    before(done => {
        function setupKafka() {
            return new Promise((resolve, reject) => {
                let {ZOOKEEPER_SERVICE_HOST = "127.0.0.1", ZOOKEEPER_SERVICE_PORT = "2181"} = process.env;
                client = new kafka.Client(
                    `${ZOOKEEPER_SERVICE_HOST}:${ZOOKEEPER_SERVICE_PORT}`,
                    "test-consumer-client");
                producer = new kafka.Producer(client);
                producer.on('ready', () => {
                    producer.createTopics(["data-arrive",
                        "data-source-added",
                        "data-source-deleted"], true, (err, data) => {
                        if (err) {
                            reject(err)
                        }
                        client.refreshMetadata(["data-arrive",
                            "data-source-added",
                            "data-source-deleted"], (err) => {
                            if (err) {
                                reject(err)
                            }
                            let message1 = {
                                s: "station-rain-other",
                                t: 1403610513000,
                                v: 110,
                                zipkinTrace: {
                                    traceID: "aaa",
                                    parentID: "bbb",
                                    spanID: "ccc",
                                    flags: 1,
                                    step: 3
                                }
                            };
                            let message2 = {
                                id: "NWHSDZ-SW",
                                dataType: "SW",
                                zipkinTrace: {
                                    traceID: "aaa",
                                    parentID: "bbb",
                                    spanID: "ccc",
                                    flags: 1,
                                    step: 3
                                }
                            };
                            let message3 = {
                                dataSourceID: "NWHSDZ-SW",
                                zipkinTrace: {
                                    traceID: "aaa",
                                    parentID: "bbb",
                                    spanID: "ccc",
                                    flags: 1,
                                    step: 3
                                }
                            };
                            producer.send([{
                                topic: "data-arrive",
                                messages: [JSON.stringify(message1)]
                            }, {
                                topic: "data-source-added",
                                messages: [JSON.stringify(message2)]
                            }, {
                                topic: "data-source-deleted",
                                messages: [JSON.stringify(message3)]
                            }], (err) => {
                                if (err) {
                                    reject(err)
                                }
                                resolve();
                            });
                        });
                    });
                });
                producer.on('error', (err) => {
                    reject(err);
                });
            });
        };
        function* setup() {
            yield setupKafka();
        };
        co(setup).then(() => {
            messageConsumer = new MessageConsumer("test-data-monitoring");
            done();
        }).catch(err => {
            done(err);
        });
    });
    describe('#startConsume()', () => {
        context('start consume message', () => {
            it('should call monitorService.monitoringData monitorService.removeMonitor' +
                'and monitorService.registerMonitor methods ' +
                'when consumer "data-arrive" "data-source-added" "data-source-deleted" topic', done => {
                let currentDoneCount = 0;

                function doneMore(err) {
                    currentDoneCount++;
                    if (currentDoneCount == 3) {
                        if (err) {
                            done(err);
                        }
                        else {
                            done();
                        }
                    }
                };
                let mockMonitorService = {};
                mockMonitorService.monitoringData = (originalData, traceContext, callback) => {
                    originalData.s.should.eql("station-rain-other");
                    originalData.t.should.eql(1403610513000);
                    originalData.v.should.eql(110);
                    doneMore();
                };
                mockMonitorService.registerMonitor = (dataSourceData, traceContext, callback) => {
                    dataSourceData.id.should.eql("NWHSDZ-SW");
                    dataSourceData.dataType.should.eql("SW");
                    doneMore();
                };
                mockMonitorService.removeMonitor = (monitorID, traceContext, callback) => {
                    monitorID.should.eql("NWHSDZ-SW");
                    doneMore();
                };
                muk(messageConsumer, "_monitorService", mockMonitorService);
                messageConsumer.startConsume();
            });
            after(done => {
                producer.close();
                client.close(() => {
                    done();
                });
            });
        });
    });
    after(done => {
        messageConsumer.stopConsume(() => {
            done();
        });
    });
});