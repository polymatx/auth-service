# Auth Service

## Overview
This project implements a robust OAuth2 authentication microservice using Node.js, MySQL, and Passport. The microservice handles user registration, login, and token issuance using OAuth2.

## Features
- User registration and login
- OAuth2 token issuance
- Client application management
- Sequelize ORM for database interactions
- Passport.js for authentication strategies
- PM2 for clustering and process management

## Prerequisites
- Node.js
- MySQL
- PM2 (for clustering)

## Setup

### 1. Clone the Repository
```bash
git clone https://github.com/polymatx/auth-service.git
cd auth-service
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables

Create an `env.json` file in the root directory and add your configuration settings. You can refer to the config/config.js for the required environment variables.

Like bellow :

```json
{
  "NODE_ENV": "production",
  "DEBUG": true,
  "MYSQL_USER": "root",
  "MYSQL_PASS": "root",
  "MYSQL_DB": "polymatx",
  "MYSQL_HOST": "127.0.0.1",
  "MYSQL_PORT": "3306",
  "SERVER_HOST": "0.0.0.0",
  "SERVER_PORT": "3001",
  "JWT_SECRET": "0vmmRxf0qcXqianKEDmm6cdng_tMrzRzFFnzB-etnuE",
  "SHOULD_ENCRYPT_TOKENS": false,
  "JWE_ENCRYPTION_KEY": "LUvvFZKeG8MTRCZLYBUHdmZoPg70hm-ZYTz6oRBCa-U",
  "DATABASE_ENCRYPTION_SECRET": "623b07cb53ec407ab641f6ef531301a2",
  "ACCESS_TOKEN_TTL": "60 days",
  "REFRESH_TOKEN_TTL": "1 year",
  "BCRYPT_SALT_ROUNDS": 10,
  "RATE_LIMIT_REQUESTS_NUMBER": 10000,
  "RATE_LIMIT_DURATION_SECONDS": 1000
}
```

### 4. Start the Application

```bash
pm2 start ecosystem.config.js
```

### Environment Variables
  - `NODE_ENV <String>`: Environment (like development, test, staging, production)
  - `DEBUG <Boolean>`: debug mode. in debug mode application logs data in the console. logs may contain sensitive data. disable it in production.
  - `MYSQL_USER <String>`: mysql database username
  - `MYSQL_PASS <String>`: mysql database password
  - `MYSQL_DB <String>`: mysql database database name
  - `MYSQL_HOST <String>`: mysql database host name
  - `MYSQL_PORT <Number>`: mysql database port
  - `DATABASE_LOGGING <Boolean>`: log database queries in console. disable it in production.
  - `SERVER_HOST <String>`: the ip or host name that server should listen on. usually should be set to `0.0.0.0` or `localhost`
  - `SERVER_PORT <Number>`: the port that server should listen to.
  - `WEB_SERVER_LOGGING <Boolean>`: log requests and other web server stuff. disable it in production. 
  - `JWT_SECRET <String>`: secret key used for JWT token generation and decoding. it should be a random unguessable string, at least 32 character. keys longer than 32 character results in performance drop.
  - `SHOULD_ENCRYPT_TOKENS <Boolean>`: enables JWT token encryption using JWE. enabling it adds more security, but it's slower. as we don't save sensitive data in tokens, it's fine to leave it off. please be careful changing this options cause all previous tokens get invalidated. 
  - `JWE_ENCRYPTION_KEY <String>`: encryption key used for JWT token encryption. should be at least 32 characters. 
  - `DATABASE_ENCRYPTION_SECRET <String>`: key used for encrypting client secrets in database. should be at least 32 characters. 
  - `ACCESS_TOKEN_TTL <String>`: access token life time. use human readable strings like `1 year, 3 months, 20 days, 24 hours, 20 m, 60s`
  - `REFRESH_TOKEN_TTL <String>`: refresh token life time. use human readable strings like `1 year, 3 months, 20 days, 24 hours, 20 m, 60s`
  - `BCRYPT_SALT_ROUNDS <Number>`: bcrypt salt hash rounds. use 10 for now.
  - `RATE_LIMIT_REQUESTS_NUMBER <Number>`: how many requests a single ip can send in. defaults to 10.
  - `RATE_LIMIT_DURATION_SECONDS <Number>`: Number of seconds before quota is reset. defaults to 1.

### Operations
- #### Register User
    - path: `/register`
    - method: `POST`
    - params:
        - body:
            - username `<String>`: Arbitrary username more than 4 characters.
                - required: `true`
            - email `<String>`: A valid email address.
                - required: `true`
            - password `<String>`: Password more than 8 characters.
                - required: `true`
            - passwordConfirmation `<String>`: Same as password.
                - required: `true`
    - response:
        - id `<Number>`: User ID
        - username `<String>`:
        - email `<String>`: 

- #### Get Token
    - path: `/oauth/token`
    - method: `POST`
    - params:
        - body:
            - grant_type `<String>`: OAuth grant. For now only supports `password` and `refresh_token` grant type.
                - required: `true`
                - value: `password`
            - username `<String>`: Email that account is registered with.
                - required: `true`
            - password: `<String>`:
                - required: `true`
            - client_id `<String>`: Client ID of application that is performing auth.
                - required: `true`
            - client_secret `<String>`: Client secret of application that is performing auth.
                - required: `true`
    - response:
        - access_token `<String>`: Short lived access token used to authenticate requests
        - refresh_token `<String>`: Long lived refresh token used to refresh access token
        - expires_at `<Object>`:
            - access_token `<Number>`: Access token expiry time
            - refresh_token `<Number>`: Refresh token expiry time
        - token_type `<String>`: Type of token 

- #### Refresh Token
    - path: `/oauth/token`
    - method: `POST`
    - params:
        - body:
            - grant_type `<String>`: OAuth grant. For now only supports `password` and `refresh_token` grant type.
                - required: `true`
                - value: `refresh_token`
            - refresh_token `<String>`: Refresh token obtained from "Get Token" operation.
                - required: `true`
            - client_id `<String>`: Client ID of application that is performing auth.
                - required: `true`
            - client_secret `<String>`: Client secret of application that is performing auth.
                - required: `true`
    - response:
        - access_token `<String>`: Short lived access token used to authenticate requests
        - refresh_token `<String>`: Long lived refresh token used to refresh access token
        - expires_at `<Object>`:
            - access_token `<Number>`: Access token expiry time
            - refresh_token `<Number>`: Refresh token expiry time
        - token_type `<String>`: Type of token 

- #### Check Token
    - path: `/check`
    - method: `GET`
    - params:
        - header:
            - Authorization `<String>`: Bearer token
                - required: `true`
    - response:
        - id `<Number>`: User ID
        - username `<String>`
        - email `<String>`

- #### Get User
    - path: `/user`
    - method: `GET`
    - params:
        - header:
            - Authorization `<String>`: Bearer token
                - required: `true`
    - response:
        - id `<Number>`: User ID
        - username `<String>`:
        - email `<String>`:
        - mobile `<String>`:
        - firstname `<String>`:
        - lastname `<String>`:
        - age `<Number>`: 
        - emailVerified `<Number>`: 0 = false, 1 = true 
        - phoneVerified `<Number>`: 0 = false, 1 = true
        - verify `<Number>`: 0 = false, 1 = true
        - rememberToken `<String>`: 
        - referralCode `<String>`: 
        - referredBy `<String>`: 
        - config `<Object>`: 
        - lastLogin `<Date>`: 
        - createdAt `<Date>`:
        - updatedAt `<Date>`:
        - deletedAt `<Date>`:
