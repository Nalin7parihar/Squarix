#/backend/Dockerfile
FROM node:iron-trixie-slim

#Set the working directory inside the container
WORKDIR /app

#Copy package.json and package-lock.json to the working directory
COPY package*.json ./

#Install backend dependencies
RUN npm install 

#COPY the rest of your backend source code
COPY . .

EXPOSE 5000

CMD ["npm", "run", "start"]