FROM node:lts-buster

WORKDIR /app

COPY . /app

RUN apt-get update && apt-get -y install python
RUN npm install -g pm2
RUN npm install --target_version=12
RUN npm rebuild bcrypt --update-binary

CMD ["pm2-runtime", "start", "ecosystem.config.js"]
