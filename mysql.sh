docker run --name hl_superset_mysql \
-e MYSQL_ROOT_PASSWORD=my-secret-pw \
-p 3306:3306 \
-d \
mysql:latest