FROM node:latest
MAINTAINER linmadan <772181827@qq.com>
COPY ./package.json /home/data-monitoring/
WORKDIR /home/data-monitoring
RUN ["npm","config","set","registry","http://registry.npm.taobao.org"]
RUN ["npm","install","--save-dev","mocha@3.2.0"]
RUN ["npm","install","--save-dev","muk@0.5.3"]
RUN ["npm","install","--save-dev","should@11.1.2"]
RUN ["npm","install","--save","co@4.6.0"]
RUN ["npm","install","--save","kafka-node@1.3.1"]
RUN ["npm","install","--save","underscore@1.8.3"]
RUN ["npm","install","--save","mongodb@2.2.21"]
RUN ["npm","install","--save","gridvo-common-js@0.0.16"]
COPY ./app.js app.js
COPY ./lib lib
COPY ./test test
VOLUME ["/home/data-monitoring"]
ENTRYPOINT ["node"]
CMD ["app.js"]