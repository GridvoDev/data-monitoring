'use strict';
const {KafkaZipkinMessageProducer} = require('gridvo-common-js');
const {tracer} = require('../../util');

class MessageProducer {
    constructor() {
        this._producer = new KafkaZipkinMessageProducer({
            tracer,
            serviceName: "data-monitoring"
        });
    }

    produceDataPublishTopicMessage(message, traceContext, callback) {
        this._producer.produceMessage("data-publish", message, traceContext, callback);
    }

    close() {
        return this._producer.close();
    }
}

module.exports = MessageProducer;