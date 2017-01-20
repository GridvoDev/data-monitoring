'use strict';
const _ = require('underscore');
const should = require('should');
const muk = require('muk');
const MonitorService = require('../../../lib/domain/service/monitorService');
const constant = require('../../../lib/domain/util/constant');

describe('MonitorService use case test', ()=> {
    let service;
    before(()=> {
        service = new MonitorService();
    });
    describe('#initMonitor(dataSourceData)', ()=> {
        context('init monitor', ()=> {
            it('init unknow datatype is return null', ()=> {
                let dataSourceData = {
                    id: "station-unknow-other"
                };
                let monitor = service.initMonitor(dataSourceData);
                _.isNull(monitor).should.equal(true);
            });
            it('init rain datatype monitor ok', ()=> {
                let dataSourceData = {
                    id: "station-rain-other"
                };
                let monitor = service.initMonitor(dataSourceData);
                monitor.monitorID.should.equal("station-rain-other");
                monitor.dataType.should.equal(constant.DATATYPE.RAIN);
                should.exist(monitor.monitoringItems.lastPublishTimestamp);
                should.exist(monitor.rules[constant.RULE.REAL_TIME_PUBLISH_RULE_ID]);
            });
            it('init waterlevel datatype monitor ok', ()=> {
                let dataSourceData = {
                    id: "station-waterlevel-shangqian"
                };
                let monitor = service.initMonitor(dataSourceData);
                monitor.monitorID.should.equal("station-waterlevel-shangqian");
                monitor.dataType.should.equal(constant.DATATYPE.WATERLEVEL);
                should.exist(monitor.monitoringItems.lastPublishTimestamp);
                should.exist(monitor.rules[constant.RULE.REAL_TIME_PUBLISH_RULE_ID]);
            });
        });
        describe('#loadMonitor(monitorData)', ()=> {
            context('load monitor', ()=> {
                it('load monitor ok', ()=> {
                    let monitorData = {
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
                    };
                    let monitor = service.loadMonitor(monitorData);
                    monitor.monitorID.should.equal("station-rain-other");
                    monitor.dataType.should.equal("rain");
                    monitor.monitoringItems.lastPublishTimestamp.should.equal(1);
                    should.exist(monitor.rules.realTimePublish);
                    should.exist(monitor.rules.realTimePublish.eventMatching);
                    monitor.rules.realTimePublish.publishSpace.should.equal(60000);
                });
            });
        });
    });
});