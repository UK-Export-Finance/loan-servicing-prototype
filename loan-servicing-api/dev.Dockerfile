FROM node:20.5.1-alpine3.17

RUN mkdir -p /opt/app
WORKDIR /opt/app

COPY package*.json .

COPY loan-servicing-common/package*.json loan-servicing-common/

COPY loan-servicing-api/package*.json loan-servicing-api/
COPY loan-servicing-api/tsconfig.json loan-servicing-api/

RUN npm i

EXPOSE 3001

WORKDIR /opt/app/loan-servicing-api
CMD ["npm","run","dev"]
