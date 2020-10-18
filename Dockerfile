FROM node:12-alpine

MAINTAINER Ferdinand Mütsch <ferdinand@muetsch.io>

WORKDIR /app

ARG base_url=/
ENV BASE_URL $base_url

COPY . /app/

VOLUME ["/app/data"]

RUN cd /app && yarn

RUN cd /app/webapp && \
    yarn && \
    yarn build && \
    cd ..

ENTRYPOINT yarn start
