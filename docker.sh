#! /bin/bash

export LC_CTYPE=C

gen_chars()
{
	echo -ne $(</dev/urandom tr -dc $1 | head -c $2)
}

gen_cert()
{
	openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout $1 -out $2 -subj "/C=US/ST=Wisconsin/L=Madison/O=Kieffer Bros., LLC/CN=localhost"
}

case $1 in
	setup)
	# create local .env file for docker
		if [ ! -f docker.env ]; then
			cp docker.dev.env docker.env
		fi
		# generate database secrets
		if [ ! -d secrets ]; then
			mkdir secrets
		fi
		if [ ! -f secrets/mongo-root-user ]; then
			echo -ne $(gen_chars a-z0-9 8) > secrets/mongo-root-user
		fi
		if [ ! -f secrets/mongo-root-pass ]; then
			echo -ne $(gen_chars a-z0-9 32) > secrets/mongo-root-pass
		fi
		if [ ! -f secrets/mongo-user ]; then
			echo -ne $(gen_chars a-z0-9 8) > secrets/mongo-user
		fi
		if [ ! -f secrets/mongo-pass ]; then
			echo -ne $(gen_chars a-z0-9 32) > secrets/mongo-pass
		fi
		# jwt secret key
		if [ ! -f secrets/jwt-secret ]; then
			echo -ne $(gen_chars a-z0-9 32) > secrets/jwt-secret
		fi
		# ssl dev certs
		if [ ! -f secrets/selfsigned.crt ]; then
			echo "Generating Backend Self-signed SSL Key and Certificate"
			gen_cert secrets/selfsigned.key secrets/selfsigned.crt
		fi

		# create docker volume for database data
		docker volume create --name=backend-db
		;;

	build-prod)
		docker-compose --env-file ./docker.env build --progress=plain
		;;

	up-prod)
		docker-compose --env-file ./docker.env up -d
		;;
	
	up-db)
		docker-compose --env-file ./docker.env up -d db
		;;

	up-backend-prod)
		docker-compose --env-file ./docker.env up -d backend
		;;

	build-dev)
		docker-compose --env-file ./docker.dev.env -f docker-compose.yml -f docker-compose.dev.yml build --progress=plain
		;;

	up-build-dev)
		docker-compose --env-file ./docker.dev.env -f docker-compose.yml -f docker-compose.dev.yml up --build --force-recreate --renew-anon-volumes -d
		;;

	up-dev)
		docker-compose --env-file ./docker.dev.env -f docker-compose.yml -f docker-compose.dev.yml up -d
		;;

	up-backend-dev)
		docker-compose --env-file ./docker.dev.env -f docker-compose.yml -f docker-compose.dev.yml up -d backend
		;;

	down)
		docker-compose --env-file ./docker.env down
		;;
	*)
		echo "Unrecognized command: $1" 
		;;
esac

