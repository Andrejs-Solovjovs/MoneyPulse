FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

RUN printf '<!doctype html><html><head><title>TEST</title></head><body style="font-family:Arial;background:#111;color:white;padding:40px"><h1>MONEYPULSE TEST PAGE</h1><p>Если ты видишь это — Dockerfile работает.</p></body></html>' > /usr/share/nginx/html/index.html

EXPOSE 80
