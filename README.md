<p align="center">
  <a href="http://github.com/brunoocastro/pada-api" target="blank">
  <img src="./public/pada.png" width="200" alt="Pada Logo" />
  </a>
</p>
<h1 align="center">
Projeto Amigo dos Animais - PADA
</h1>
<p align="center">
  An open-source project to facilitate pet adoption.
</p>
</p>

# Project History

This is not just any project, the idea for this project came about in mid-2015 when I was in my first year of high school. This was the first website I made in my life, at a time when I didn't even know what a programming language was.

The goal was to facilitate the adoption of animals in my city, which was a big problem at the time. The project even deployed with the support of my teacher and several veterinary clinics in the city, but it was not used on a large scale by the population.

It was made (at the time) in the [WIX website generator](wix.com) and presented as a final paper for a sociology course.

Today I decided to redo it, after a few years of experience in the area, as a personal project and as a proof of concept in a [framework (NestJS)](https://nestjs.com/) that I hadn't worked on yet.

I'm really happy to finally get it into production. This is just the API, soon I will make a website to consume it and the Projeto Amigo dos Animais (PADA) will come back to life!

### You can access a legacy [Facebook page here](https://www.facebook.com/pamigodosanimais)

---

# Running locally

## Installation

```bash
# install project dependencies
$ npm install
```

## Configure DB Migration

### **OBS**: Before migration, ensure that you have a configured .env file based on .env.example

```bash
# migrate dev db
$ npm run migrate:dev
```

## Start project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

---

# Deployed API for Tests

## Deploy

Currently I'm using [Railway](https://railway.app) to free deploy my application

You can access my deploy [here](https://pada-api.up.railway.app) or accessing this link:

[https://pada-api.up.railway.app](https://pada-api.up.railway.app)

## Confirmation mails

As I am using a free mail sender provider for testing, it is necessary to authorize the receipt of an email from the provider.

So, here are some previously authorized emails for testing using free email provider [YOPmail](https://yopmail.com):

- pada-test-1@yopmail.com
- pada-test-2@yopmail.com
- pada-test-3@yopmail.com
- pada-test-4@yopmail.com
- pada-test-5@yopmail.com

You can access any of this mailboxes using "?email" after Yopmail URL, like this:

- [https://yopmail.com?pada-test-1](https://yopmail.com?pada-test-1) 

or

- [https://yopmail.com?pada-test-1@yopmail.com](https://yopmail.com?pada-test-1@yopmail.com)

---

## Stay in touch

- Author - [Bruno "Tonelive" Castro](https://linked.in/brunoocastro)
- GitHub - [https://github.com/brunoocastro/pada-api](https://github.com/brunoocastro/pada-api)
- Twitter - [@otonelive](https://twitter.com/otonelive)
- Twitch - [@tonelive](https://twitch.com/tonelive)
