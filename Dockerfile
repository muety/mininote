FROM node:22-alpine

MAINTAINER Ferdinand Mütsch <ferdinand@muetsch.io>

WORKDIR /app

ARG base_url=/
ENV BASE_URL $base_url

COPY . /app/

VOLUME ["/app/data"]

RUN cd /app && \
    corepack enable && \
    yarn set version stable && \
    yarn

RUN cd /app/webapp && \
    corepack enable && \
    yarn set version stable && \
    yarn && \
    yarn build:base && \
    cd ..

ENTRYPOINT yarn start
