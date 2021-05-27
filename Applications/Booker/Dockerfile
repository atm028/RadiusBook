FROM node:15.14.0-alpine3.13

RUN addgroup -S rb && adduser -S rb -G rb

RUN mkdir /opt/rb
RUN mkdir /opt/rb/Applications
RUN mkdir /opt/rb/Applications/Booker
RUN mkdir /opt/rb/Applications/BookParser
RUN mkdir /opt/rb/Applications/Bookshelf
WORKDIR /opt/rb

RUN chown -R rb /opt/rb

COPY --chown=rb ./Applications/Booker/config ./Applications/Booker/config
COPY --chown=rb ./Applications/BookParser/config ./Applications/BookParser/config
COPY --chown=rb ./Applications/Bookshelf/config ./Applications/Bookshelf/config

COPY --chown=rb ./Applications/Booker/container.ts ./Applications/Booker/container.ts
COPY --chown=rb ./Applications/Booker/index.ts ./Applications/Booker/index.ts
COPY --chown=rb ./Applications/Booker/package.json ./Applications/Booker/package.json
COPY --chown=rb ./Applications/Booker/schema.ts ./Applications/Booker/schema.ts
COPY --chown=rb ./Applications/Booker/queries ./Applications/Booker/queries
COPY --chown=rb ./Common ./Common
COPY --chown=rb ./Domain ./Domain
COPY --chown=rb ./Persistence ./Persistence
COPY --chown=rb ./lerna.json ./lerna.json
COPY --chown=rb ./package.json ./package.json
COPY --chown=rb ./tsconfig.json ./tsconfig.json
COPY --chown=rb ./yarn.lock ./yarn.lock

RUN yarn install && yarn bootstrap

EXPOSE 9090

CMD ["yarn", "run", "booker"]