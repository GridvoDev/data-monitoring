'use strict';
const MongoClient = require('mongodb').MongoClient;
const _ = require('underscore');
const should = require('should');
const Monitor = require('../../../lib/domain/monitor');
const MonitorService = require('../../../lib/domain/service/monitorService');
const mongoDBMonitorRepository = require('../../../lib/infrastructure/repository/mongoDBMonitorRepository');


describe('mongoDBMonitorRepository use case test', ()=> {
    let Repository;
    let monitorService;
    before(()=> {
        Repository = new mongoDBMonitorRepository();
        monitorService = new MonitorService();
    });
    describe('#save(monitor, traceContext, cb)', ()=> {
        context('save a monitor', ()=> {
            it('should return true if save success', done=> {
                let monitor = monitorService.initMonitor({id: "station-rain-other"});
                Repository.save(monitor, {}, (err, isSuccess)=> {
                    if (err) {
                        done(err);
                    }
                    isSuccess.should.be.eql(true);
                    done();
                });
            });
        });
    });
    describe('#getMonitorByID(id, traceContext, cb)', ()=> {
        context('get a monitor for id', ()=> {
            it('should return null if no this monitor', done=> {
                let monitorID = "noMonitorID";
                Repository.getMonitorByID(monitorID, {}, (err, monitor)=> {
                    _.isNull(monitor).should.be.eql(true);
                    done();
                });
            });
            it('should return monitor', done=> {
                let id = "station-rain-other";
                Repository.getMonitorByID(id, {}, (err, monitor)=> {
                    monitor.id.should.be.eql("station-rain-other");
                    done();
                });
            });
        });
    });
    after(done=> {
        let {MONGODB_SERVICE_HOST = "127.0.0.1", MONGODB_SERVICE_PORT = "27017"}= process.env;
        MongoClient.connect(`mongodb://${MONGODB_SERVICE_HOST}:${MONGODB_SERVICE_PORT}/DataMonitoring`, (err, db)=> {
            if (err) {
                done(err);
            }
            db.collection('Monitor').drop((err, response)=> {
                if (err) {
                    done(err);
                }
                db.close();
                done();
            });
        });
    });
});