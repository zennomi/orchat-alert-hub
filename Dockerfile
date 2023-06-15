FROM node:16.14.0
LABEL maintainer="raijinryuu"
RUN mkdir -p /usr/src/orchai-chabot
WORKDIR /usr/src/orchai-chabot
COPY ./ /usr/src/orchai-chabot
RUN yarn
RUN yarn build
CMD [ "yarn", "start" ]

