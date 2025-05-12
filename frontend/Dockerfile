FROM node:20-alpine

WORKDIR /app

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .
COPY server.crt .
COPY server.key .

CMD ["npm", "start"]
