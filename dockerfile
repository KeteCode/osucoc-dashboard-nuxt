FROM node:16

WORKDIR /usr/src/app

COPY . ./
RUN yarn

EXPOSE 80

ENV HOST=0.0.0.0
ENV PORT=80

RUN yarn build

CMD [ "yarn", "start" ]