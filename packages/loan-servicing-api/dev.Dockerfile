FROM node:20.5.1-alpine3.17

RUN mkdir -p /opt/app
WORKDIR /opt/app

COPY package*.json .

COPY libs/loan-servicing-common/package*.json libs/loan-servicing-common/

COPY packages/loan-servicing-api/package*.json packages/loan-servicing-api/
COPY packages/loan-servicing-api/tsconfig.json packages/loan-servicing-api/

RUN npm i

EXPOSE 3001

WORKDIR /opt/app/packages/loan-servicing-api
CMD ["npm","run","dev"]
