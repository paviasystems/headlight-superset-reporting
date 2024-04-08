FROM apache/superset
# Switching to root to install the required packages
USER root
# Example: installing the MySQL driver to connect to the metadata database
# if you prefer Postgres, you may want to use `psycopg2-binary` instead
RUN pip install mysqlclient
# Switching back to using the `superset` user
USER superset
ENV SUPERSET_SECRET_KEY=9jsrJd2WSfIiuMmoYfeeL6RRAu1z68+Cox9VdwtrwtgaZsvRiShPJpDh
RUN export SUPERSET_SECRET_KEY=9jsrJd2WSfIiuMmoYfeeL6RRAu1z68+Cox9VdwtrwtgaZsvRiShPJpDh
RUN superset db upgrade
RUN superset fab create-admin --username headlight --firstname admin --lastname admin --email admin --password ItsASuperS3cret
RUN superset init