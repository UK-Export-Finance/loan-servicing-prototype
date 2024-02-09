FROM node:20.5.1-alpine3.17

RUN mkdir -p /opt/app
WORKDIR /opt/app

COPY package.json .
COPY package-lock.json .

RUN npm i

COPY tsconfig.json .

EXPOSE 3000
CMD ["npm","run","dev"]
