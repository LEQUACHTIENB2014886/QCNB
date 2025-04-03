# Docker file

# Use the node image from official Docker Hub
FROM node:22.12.0-alpine AS build

# set the working directory
WORKDIR /qcnb_web

# Copy the working directory in the container
COPY package*.json ./

# Install the project dependecies
RUN npm install 

# Copy the rest of the project files to the container
COPY . .

# Build the Vue.js application to the production mode to dist folder
RUN npm run build

# use the lightweight Nginx image from the previous stage to the nginx container
FROM nginx:alpine AS production-stage

# Copy the build application from the previous stage to the Nginx container
COPY --from=build /qcnb_web/dist /usr/share/nginx/html

# Copy SSL certificates and keys
COPY localhost+4.pem /etc/ssl/certs/server.crt
COPY localhost+4-key.pem /etc/ssl/private/server.key

# Copy the nginx configuration file
COPY nginx.conf /etc/nginx/nginx.conf

# Expose the ports
EXPOSE 80
EXPOSE 443

# Start Nginx to serve the application
CMD ["nginx", "-g", "daemon off;"]

