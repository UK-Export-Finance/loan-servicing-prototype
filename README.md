# Loan Servicing Prototype

## Running

Run the applications by running `npm run dev` in the repo root

If the `package.json` of any application is updated the rebuild the dev container with
`npm run dev:build`

## Initial Setup

Copy the `.env.sample` file as `.env` and add the [default Azurite connection string](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=visual-studio%2Cblob-storage#http-connection-strings) for all conneciton string values.

Replace all instances of `127.0.0.1` with `dev-azurite`

Launch the docker compose with `npm run dev`

Run the initial setup scripts by running `sh initial-setup.sh`

The applications should now be ready to go.
