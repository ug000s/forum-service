FROM node:24.15.0-alpine
LABEL authors="ijn123 <ijn123@gmail.com>"

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY ./src ./src

EXPOSE 8080

CMD ["npm", "start"]