FROM node:18.20.3
# Create app directory
WORKDIR /src/server
# Install app dependencies
COPY . .
RUN npm install

# Build TypeScript to JavaScript
RUN npm run build

EXPOSE 7001

CMD [ "npm", "run", "start:node" ]