# To enable ssh & remote debugging on app service change the base image to the one below
# FROM mcr.microsoft.com/azure-functions/node:4-node18-appservice
FROM mcr.microsoft.com/azure-functions/node:4-node18

ENV AzureWebJobsScriptRoot=/home/site/wwwroot/packages/loan-servicing-functions \
    FUNCTIONS_WORKER_RUNTIME=node \
    AzureFunctionsJobHost__Logging__Console__IsEnabled=true \
    AzureWebJobsStorage=$AzureWebJobsStorage \
    StorageConnectionString=$StorageConnectionString \
    AzureWebJobsStorageConnectionString=$AzureWebJobsStorageConnectionString

WORKDIR /home/site/wwwroot

COPY package*.json .

COPY libs/loan-servicing-common/package*.json libs/loan-servicing-common/

COPY packages/loan-servicing-functions/package*.json packages/loan-servicing-functions/

RUN cd packages/loan-servicing-functions && npm install

WORKDIR /home/site/wwwroot/packages/loan-servicing-functions

ENTRYPOINT [ "npm", "run", "watch:docker" ]