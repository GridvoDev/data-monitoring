'use strict';
const _ = require('underscore');
const should = require('should');
const muk = require('muk');
const MonitorService = require('../../../lib/application/service/monitorService');
const {createMonitorService} = require('../../../lib/domain');

describe('MonitorService use case test', ()=> {
    let service;
    before(()=> {
        service = new MonitorService();
    });
    describe('#registerMonitor(dataSourceData, traceContext, callback)', ()=> {
        context('register data source', ()=> {
            it('if data source data no "id station lessee",is fail', done=> {
                let dataSourceData = {};
                service.registerMonitor(dataSourceData, {}, (err, isSuccess)=> {
                    if (err) {
                        done(err);
                    }
                    isSuccess.should.be.eql(false);
                    done();
                });
            });
            it('if monitor already existed,is fail', done=> {
                let mockMonitorRepository = {};
                mockMonitorRepository.getMonitorByID = (monitorID, traceContext, callback)=> {
                    callback(null, {});
                };
                muk(service, "_monitorRepository", mockMonitorRepository);
                let dataSourceData = {
                    id: "station-rain-other"
                };
                service.registerMonitor(dataSourceData, {}, (err, isSuccess)=> {
                    if (err) {
                        done(err);
                    }
                    isSuccess.should.be.eql(false);
                    done();
                });
            });
            it('is success', done=> {
                let mockMonitorRepository = {};
                mockMonitorRepository.getMonitorByID = (monitorID, traceContext, callback)=> {
                    callback(null, null);
                };
                mockMonitorRepository.save = (monitor, traceContext, callback)=> {
                    callback(null, true);
                };
                muk(service, "_monitorRepository", mockMonitorRepository);
                let dataSourceData = {
                    id: "station-rain-other"
                };
                service.registerMonitor(dataSourceData, {}, (err, isSuccess)=> {
                    if (err) {
                        done(err);
                    }
                    isSuccess.should.be.eql(true);
                    done();
                });
            });
        });
    });
    describe('#monitoringData(originalData, traceContext, callback)', ()=> {
        context('monitoring original data', ()=> {
            it('if original data no "s t v",is fail', done=> {
                let originalData = {};
                service.monitoringData(originalData, {}, (err, isSuccess)=> {
                    if (err) {
                        done(err);
                    }
                    isSuccess.should.be.eql(false);
                    done();
                });
            });
            it('if no this monitor,is fail', done=> {
                let mockMonitorRepository = {};
                mockMonitorRepository.getMonitorByID = (monitorID, traceContext, callback)=> {
                    callback(null, null);
                };
                muk(service, "_monitorRepository", mockMonitorRepository);
                let originalData = {};
                originalData.s = "no-data-source";
                originalData.t = (new Date()).getTime();
                originalData.v = 1;
                service.monitoringData(originalData, {}, (err, isSuccess)=> {
                    if (err) {
                        done(err);
                    }
                    isSuccess.should.be.eql(false);
                    done();
                });
            });
            it('is success', done=> {
                let currentDoneCount = 0;

                function doneMore(err) {
                    currentDoneCount++;
                    if (currentDoneCount == 2) {
                        if (err) {
                            done(err);
                        }
                        else {
                            done();
                        }
                    }
                };
                let mockMonitorRepository = {};
                mockMonitorRepository.getMonitorByID = (monitorID, traceContext, callback)=> {
                    let monitor = createMonitorService().loadMonitor({
                        monitorID: "station-rain-other",
                        dataType: 'rain',
                        rules: {
                            realTimePublish: {
                                id: 'realTimePublish',
                                name: '实时推送',
                                publishSpace: 60000,
                                isOpen: true
                            }
                        },
                        monitoringItems: {
                            lastPublishTimestamp: 1
                        }
                    });
                    callback(null, monitor);
                };
                mockMonitorRepository.save = (monitor, traceContext, callback)=> {
                    callback(null, true);
                };
                muk(service, "_monitorRepository", mockMonitorRepository);
                let timestamp = (new Date()).getTime();
                let mockMessageProducer = {};
                mockMessageProducer.produceDataPublishTopicMessage = (message, traceContext, callback)=> {
                    message.dataSource.should.equal("station-rain-other");
                    message.timestamp.should.equal(timestamp);
                    message.value.should.equal(1);
                    doneMore();
                }
                muk(service, "_messageProducer", mockMessageProducer);
                let originalData = {
                    s: "station-rain-other",
                    t: timestamp,
                    v: 1
                };
                service.monitoringData(originalData, {}, (err, isSuccess)=> {
                    if (err) {
                        doneMore(err);
                    }
                    isSuccess.should.be.eql(true);
                    doneMore();
                });
            });
        });
    });
    after(()=> {
        muk.restore();
    });
});