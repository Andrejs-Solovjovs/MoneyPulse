FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY index.html /usr/share/nginx/html/index.html
COPY auth.html /usr/share/nginx/html/auth.html
COPY dashboard.html /usr/share/nginx/html/dashboard.html
COPY insights.html /usr/share/nginx/html/insights.html
COPY styles.css /usr/share/nginx/html/styles.css
COPY script.js /usr/share/nginx/html/script.js
COPY dashboard.js /usr/share/nginx/html/dashboard.js
COPY supabase.js /usr/share/nginx/html/supabase.js

EXPOSE 80
