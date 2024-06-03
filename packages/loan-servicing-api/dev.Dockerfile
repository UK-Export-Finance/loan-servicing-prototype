FROM node:20-bookworm-slim

RUN mkdir -p /opt/app
WORKDIR /opt/app

COPY package*.json .

COPY libs/loan-servicing-common/package*.json libs/loan-servicing-common/

COPY packages/loan-servicing-api/package*.json packages/loan-servicing-api/

RUN npm i

COPY packages/loan-servicing-api/tsconfig.json packages/loan-servicing-api/

EXPOSE 3001

WORKDIR /opt/app/packages/loan-servicing-api
CMD ["npm","run","dev"]
