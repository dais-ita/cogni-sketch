FROM node:alpine
WORKDIR /usr/src/cogni-sketch
COPY . .
RUN npm install
EXPOSE 5010:5010/tcp
CMD [ "npm", "start"]
