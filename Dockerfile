FROM node:16
WORKDIR /usr/src/pada-api
RUN npm install
EXPOSE 3000
CMD [  "npm", "run", "start:migrate:prod" ]
