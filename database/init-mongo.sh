#! /bin/bash
mongosh -- "$MONGO_INITDB_DATABASE" <<EOF
    var rootUser = '$MONGO_INITDB_ROOT_USERNAME';
    var rootPassword = '$MONGO_INITDB_ROOT_PASSWORD';
    var admin = db.getSiblingDB('admin');
    admin.auth(rootUser, rootPassword);

    var user = '$(cat "$MONGO_USERNAME_FILE")';
    var passwd = '$(cat "$MONGO_PASSWORD_FILE")';
    db.createUser({user: user, pwd: passwd, roles: ["readWrite"]});
EOF