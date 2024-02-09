FROM node:20.5.1-alpine3.17

RUN mkdir -p /opt/app
WORKDIR /opt/app

COPY packages/loan-servicing-ui/package*.json .

RUN npm i

COPY packages/loan-servicing-ui/tsconfig.json .

EXPOSE 3000
WORKDIR /opt/app/packages/loan-servicing-ui
CMD ["npm","run","dev"]
