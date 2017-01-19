'use strict';
const MonitorService = require("./monitorService");

let monitorService = null;
function createMonitorService(single = true) {
    if (single && monitorService) {
        return monitorService;
    }
    monitorService = new MonitorService();
    return monitorService;
};

module.exports = {
    createMonitorService
};