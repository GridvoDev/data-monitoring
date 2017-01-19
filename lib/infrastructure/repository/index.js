'use strict';
const MongoDBMonitorRepository = require("./mongoDBMonitorRepository");

let mongoDBMonitorRepository = null;
function createMonitorRepository(single = true) {
    if (single && mongoDBMonitorRepository) {
        return mongoDBMonitorRepository;
    }
    mongoDBMonitorRepository = new MongoDBMonitorRepository();
    return mongoDBMonitorRepository;
};

module.exports = {
    createMonitorRepository
};