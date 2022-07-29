# Use this to build a production image of the Mosaic Frontend Samples app published in a Nginx container.

FROM nginx:stable-alpine

RUN rm /etc/nginx/conf.d/default.conf

# Copy Nginx configuration files
COPY ["./nginx/nginx.conf", "/etc/nginx/"]
COPY ["./nginx/mosaic-fe-samples.conf", "/etc/nginx/conf.d/"]

# Copy build-artifact
COPY ["./build", "/usr/share/nginx/html/"]

CMD ["nginx", "-g", "daemon off;"]

EXPOSE 80/tcp
