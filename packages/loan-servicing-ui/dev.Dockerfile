FROM node:20.5.1-alpine3.17

RUN mkdir -p /opt/app
WORKDIR /opt/app

COPY package*.json .

COPY libs/loan-servicing-common/package*.json libs/loan-servicing-common/

COPY packages/loan-servicing-ui/package*.json packages/loan-servicing-ui/
COPY packages/loan-servicing-ui/tsconfig.json packages/loan-servicing-ui/

RUN npm i

COPY packages/loan-servicing-ui/tsconfig.json .

EXPOSE 3000
WORKDIR /opt/app/packages/loan-servicing-ui
CMD ["npm","run","dev"]
