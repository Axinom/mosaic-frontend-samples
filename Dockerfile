# Use this to build a production image of the Mosaic Frontend Samples app published in a Nginx container.

FROM nginx:stable-alpine

# With SDU/Hosting, we expect the containers to have `1000` as the user's ID and GID.
# While we use the inbuilt `nginx` user to run the server, its id and gid are 101, so we change it here.
RUN echo http://dl-2.alpinelinux.org/alpine/edge/community/ >> /etc/apk/repositories && \
    apk --no-cache add shadow && \
    groupmod -g 1000 nginx && \
    usermod -u 1000 -g 1000 nginx && \
    apk del shadow

RUN rm /etc/nginx/conf.d/default.conf

# Copy Nginx configuration files
COPY ["./nginx/nginx.conf", "/etc/nginx/"]
COPY ["./nginx/mosaic-fe-samples.conf", "/etc/nginx/conf.d/"]

# Copy build-artifact
COPY ["./build", "/usr/share/nginx/html/"]

RUN chown -R nginx:nginx /usr/share/nginx && \
    chown -R nginx:nginx /etc/nginx && \
    chown -R nginx:nginx /var/cache/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

USER nginx

CMD ["nginx", "-g", "daemon off;"]

EXPOSE 8080/tcp
