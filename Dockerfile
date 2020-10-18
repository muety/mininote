FROM node:12-alpine

MAINTAINER Ferdinand Mütsch <ferdinand@muetsch.io>

WORKDIR /app

ENV MININOTE_PORT 3000

COPY . /app/

VOLUME ["/app/data"]

RUN cd /app && yarn

RUN cd /app/webapp && \
    yarn && \
    yarn build && \
    cd ..

ENTRYPOINT yarn start
