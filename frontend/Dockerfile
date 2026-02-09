# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Accept build-time variable for API URL
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/templates/default.conf.template
ENV PORT=80
ENV DOLLAR='$'
CMD /bin/sh -c 'envsubst "\$PORT \$DOLLAR" < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && exec nginx -g "daemon off;"'
