FROM node:18 AS build
WORKDIR /build
COPY . .
RUN npm install && \
    npm run build

FROM node:18
USER node
WORKDIR /app
COPY --from=build /build/dist/ .
COPY --from=build /build/node_modules/ node_modules/
EXPOSE 3000
ENTRYPOINT ["node"]
CMD ["./index.js"]
