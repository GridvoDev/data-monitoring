'use strict';
const _ = require('underscore');
const should = require('should');
const muk = require('muk');
const MonitorService = require('../../../lib/application/service/monitorService');

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
                mockMonitorRepository.getMonitorByID = (monitorID, {}, callback)=> {
                    callback(null, {});
                };
                muk(service, "_monitorRepository", mockMonitorRepository);
                let dataSourceData = {
                    id: "/station/datatype/other",
                    station: "stationID",
                    lessee: "lesseeID"
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
                    id: "/station/datatype/other",
                    station: "stationID",
                    lessee: "lesseeID"
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
    after(()=> {
        muk.restore();
    });
});