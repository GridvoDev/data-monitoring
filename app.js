'use strict';
const kafka = require('kafka-node');
const {logger} = require('./lib/util');
const {MessageConsumer} = require('./lib/kafka');

let {ZOOKEEPER_SERVICE_HOST = "127.0.0.1", ZOOKEEPER_SERVICE_PORT = "2181"} = process.env;
let Producer = kafka.HighLevelProducer;
let client = new kafka.Client(`${ZOOKEEPER_SERVICE_HOST}:${ZOOKEEPER_SERVICE_PORT}`);
let initProducer = new Producer(client);
initProducer.on('ready', function () {
    initProducer.createTopics(["data-arrive",
        "data-source-added",
        "zipkin"], true, (err)=> {
        if (err) {
            logger.error(err.message);
            return;
        }
        client.refreshMetadata(["data-arrive",
            "data-source-added",
            "zipkin"], ()=> {
            initProducer.close(()=> {
                logger.info("init kafka topics success");
                let messageConsumer = new MessageConsumer();
                messageConsumer.startConsume();
                logger.info("start consuming topics");
            });
        });
    });
});
initProducer.on('error', (err)=> {
    logger.error(err.message);
});