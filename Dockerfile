FROM node:16
WORKDIR /usr/src/pada-api
RUN npm install
COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD [  "npm", "run", "start:dev" ]
