FROM node:18 AS client-build

WORKDIR /app/client

COPY client/package.json client/package-lock.json ./
RUN npm install

COPY client/ ./
RUN npm run build

# Stage 2: Build the server
FROM node:18 AS server-build

WORKDIR /app/server

COPY server/package.json server/package-lock.json ./
RUN npm install

COPY server/ ./

# Copy the built client files to the server's public directory
COPY --from=client-build /app/client/dist /app/server/public

EXPOSE 1337

ENV IS_DOCKER=true

CMD ["node", "server.js"]