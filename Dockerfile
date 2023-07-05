# Use this to build a production image of the Mosaic Frontend Samples app published in a Nginx container.

FROM nginx:stable-alpine

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
