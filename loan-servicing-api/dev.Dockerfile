FROM node:20.5.1-alpine3.17

RUN mkdir -p /opt/app
WORKDIR /opt/app

COPY package.json .
COPY package-lock.json .

RUN npm i

EXPOSE 3001
CMD ["npm","run","dev"]
