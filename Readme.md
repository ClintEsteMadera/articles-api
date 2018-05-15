# articles-api

Simple Restful CRUD API that allows users to manage users and articles. Using Node.js, Express and MongoDB.

## Steps to Setup

1. Install dependencies

```bash
npm install
```

2. Run Server

```bash
npm start
```

You can browse the APIs at <http://localhost:3000/api-docs>

## Authentication
All requests (except for the one that implements a "ping", `/status`) must be accompanied by a proper JWT token for authentication purposes.
Generally speaking, the syntax for the HTTP header to be passed in all secured requests is as follows:

`Authorization: Bearer <Some_JWT_Token>`

In production environments, it is assumed that there will be either an endpoint or a separate auth server in charge of providing users with a proper token.
For dev and testing purposes, users can use the following test token:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YWY2MzI4M2JkNDRkYzQ2OGRhYTdhODgiLCJuYW1lIjoiQ2xpbnRFc3RlTWFkZXJhIiwiYXZhdGFyIjoiaHR0cHM6Ly9ncmF2YXRhci5jb20vY2xpbnRlc3RlbWFkZXJhIiwiaWF0IjoxNTI2MzQyMDYwLCJleHAiOjE1NTc4NzgwNjB9.E0rSex56ri2ti3YZOYN3lyTkBNDnbX_q9UmcA4ar4v0
```

In order to verify whether the token is valid, Node's JWT SDK is provided with a secret key that is taken from the `JWT_PRIVATE_KEY` environmental variable.
In development, and for simplicity, this secret is held in the `.env` file located at the root of the project. This file is read at startup time and its value gets read transparently using Node's `process.env` standard mechanism.

### Swagger-UI: Important Note
As of May 2018, Swagger UI does not add the `Authorization` header to the request, when the API spec is built using the standard sections (for both `Swagger 2.0` and the new `Open API 3.0.0`).
For that reason, this project is configured using `Swagger 2`, and custom `Authorization` parameters have been added to all the secure endpoints mentioned above. When Swagger-UI starts working well on this regard, it is expected from maintainers of this project to use the Open API v3.0.0 included in this project (see `swagger3.json` at the root directory) and remove all the custom header params that were artificially added in order to be able to use Swagger-UI with this API. 