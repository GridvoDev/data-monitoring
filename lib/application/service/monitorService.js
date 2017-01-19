'use strict';
const _ = require('underscore');
const co = require('co');
const {createMonitorService} = require('../../domain/');


class Service {
    constructor() {
        this._monitorRepository = null;
    }

    registerMonitor(dataSourceData, traceContext, callback) {
        if (!dataSourceData || !dataSourceData.id || !dataSourceData.station || !dataSourceData.lessee) {
            callback(null, false);
            return;
        }
        let self = this;

        function getMonitorFromRepository() {
            return new Promise((resolve, reject)=> {
                self._monitorRepository.getMonitorByID(dataSourceData.id, traceContext, (err, monitor)=> {
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
            let monitor = yield getMonitorFromRepository();
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
}

module.exports = Service;