'use strict';
const _ = require('underscore');
const should = require('should');
const muk = require('muk');
const DataPoint = require('../../../lib/domain/dataPoint');
const Monitor = require('../../../lib/domain/monitor');
const MonitorService = require('../../../lib/domain/service/monitorService');
const constant = require('../../../lib/domain/util/constant');

describe('Monitor use case test', ()=> {
    let monitorService;
    before(()=> {
        monitorService = new MonitorService();
    });
    describe('#monitoringData(dataPoint)', ()=> {
        context('monitoring data', ()=> {
            it('return false if data source no matching', ()=> {
                let monitor = monitorService.initMonitor({
                    id: "station-rain-other"
                });
                let dataPoint = new DataPoint({
                    dataSource: "station-water-other",
                    timestamp: (new Date()).getTime(),
                    value: 100
                });
                let result = monitor.monitoringData(dataPoint);
                result.should.equal(false);
            });
            it('return true but no happen if no rule event matching', ()=> {
                let monitor = monitorService.initMonitor({
                    id: "station-rain-other"
                });
                let dataPoint = new DataPoint({
                    dataSource: "station-rain-other",
                    timestamp: -1,
                    value: 100
                });
                let result = monitor.monitoringData(dataPoint);
                result.should.equal(true);
            });
            it('return true ,update monitoringItems and emit event if rule event matching', done=> {
                let monitor = monitorService.initMonitor({
                    id: "station-rain-other"
                });
                let timestamp = (new Date()).getTime();
                let dataPoint = new DataPoint({
                    dataSource: "station-rain-other",
                    timestamp,
                    value: 100
                });
                monitor.monitoringItems.lastPublishTimestamp.should.equal(1);
                monitor.on(constant.EVENT.DATA_PUBLISH, (dataPublishEvent)=> {
                    dataPublishEvent.name.should.equal(constant.EVENT.DATA_PUBLISH);
                    dataPublishEvent.dataSource.should.equal("station-rain-other");
                    monitor.monitoringItems.lastPublishTimestamp.should.equal(timestamp);
                    done();
                });
                let result = monitor.monitoringData(dataPoint);
                result.should.equal(true);
            });
        });
    });
});