#platform??
FROM node:21.1-alpine3.17
#ARG TARGETPLATFORM
#ARG BUILDPLATFORM
#RUN echo "Esto está ejecutandose en $BUILDPLATFORM, se contruirá para la plataforma $TARGETPLATFORM" > /log
WORKDIR /app
COPY package*.json ./
RUN npm install --prod
COPY ./src ./src
EXPOSE 3001
CMD ["node", "./src/index.js"]

HEALTHCHECK CMD curl --fail http://localhost:3001 || exit 1

#Red: docker network create -d bridge mi-red

#docker container rm -f api-validacion
#docker image rm -f back-img

#docker build -t back-img .
#docker container run -d --name api-validacion --env-file .env -p 3001:3001 --network=mi-red back-img
