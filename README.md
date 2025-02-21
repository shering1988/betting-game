Betting Game
---

Web application to manage betting games for sports tournaments like soccer world cups. Consists of a RESTful API powered by [Symfony](https://symfony.com/) and a modern frontend using [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/) and [MaterialUI](https://mui.com/).

Currently only available in german, but further languages are planned.

---

## General

### Requirements

- Docker Compose
- Composer
- NPM
- NodeJS

---

### TODO

* i18n
* installation wizard
* custom themes
* update dependencies
* update symfony to 7.*
* enhance README.MD

---

## Backend / API

### Stack

- PHP 8.1
- Composer
- Symfony 6.3

### Setup

Switch to ```backend``` and run ```composer install``` followed by ```docker compose -f ./docker-compose.yml up -d``` to install all packages and start all neccessary containers (php, nginx, mariaDB).

The API is now available at https://localhost:3169/

MariaDB is available at:

- from host machine: mysql://root:root@127.0.01:3168?betting_game
- from container: mysql://root:root@betting-game-mysql:3306?betting_game

To initialize the empty database run ```symfony console doctrine:schema:update```

To create some locale data fixtures run ```symfony console doctrine:fixtures:load```.

To run some symfony commands connect to container via `docker compose exec php bash`.
While in development do not run ```php bin/console ...```, instead use ```symfony console ...``` to make sure the correct env file is loaded ([more information](https://symfonycasts.com/screencast/symfony-doctrine/console#play)).

---

## Frontend

### Stack

- React
- TypeScript
- Node
- MaterialUI
- AjvSchemaValidator

### Setup

Switch to ```frontend``` and run ```npm install``` to install all neccessary packages.

Run ```npm start``` to start local server for development.

Start chrome with ```google-chrome --args --disable-web-security --allow-running-insecure-content --user-data-dir="~/Projekte/etecture/chrome-insecure" --ignore-certificate-errors``` to avoid ssl errors.

If you created the fixtures in the backend installation guide, you can now login with one of the users mentioned in `backend/src/Fixtures/UserFixtures.php`

## Deployment

Please follow the deployment guides of [Symfony 6.4](https://symfony.com/doc/6.4/deployment.html).

Note: please adjust the URL of your frontend in `backend/config/services.yaml` so that emails contain the correct URLs.