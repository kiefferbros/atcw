# And the Consequences Were
And the Consequences Were (atcw) is a madlib-like game where player fill in story templates to create stories together. It is based on the pen and paper game called Consequences aka He Said, She Said. Its frontend is a Reactjs app, and its backend is an Expressjs app with a MongoDB database. The project is containerized with Docker.

## Requirements
1. Node 16 or later
2. NPM 7 or later
3. Docker
4. Docker Compose

## Setup
1. In your terminal navigate to the project directory and run `./docker.sh setup` This creates project secrets (database credentials, jwt key, selfsigned dev ssl keys and certs), a docker volume for persistent database data, and an enviroment variables file for docker production builds
2. Modify docker.env for deployment needs

## Running Development Containers
1. Start Docker
2. Run `./docker.sh build-dev` to build dev containers
3. `./docker.sh up-dev`
See docker shell script for additional docker shortcuts

## Running Production Containers
1. Start Docker
2. `./docker.sh build-prod`
3. `./docker.sh up-prod`

## Running Database Container Only
1. Start Docker
2. `./docker.sh up-db`

## Shutdown Containers
`./docker.sh down`

## Local Development
You can develop locally outside of docker containers too.

### Backend
1. `./docker.sh up-db`
2. `cd backend`
3. `npm install`
4. `npm run dev`

### Frontend
1. `./docker.sh up-backend-dev` or `./docker.sh up-backend-prod`
2. `cd frontend`
3. `npm install`
4. `npm run dev`
