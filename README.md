# NodeJS 2024 Starter Code w/ Auth (TEMPLATE)

## Start a New Project Using This Template

1. Click the "Use this template" button
2. Install packages: `npm i`
3. Create .env file and replace credentials:

```.env
    MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.ey9pqsg.mongodb.net/<db>?retryWrites=true&w=majority

    JWT_SECRET=6a627a7fb025e2c5db643267523a1c801c1178bed30331a2606fe93f4dd9aa7b

    SERVER_URL=http://localhost:5000

    CP_SECRET=<create/replace secret>

    PORT=<add port>

    NODEMAILER_HOST=smtp.ethereal.email
    NODEMAILER_PORT=<add nodemailer port>
    NODEMAILER_USER=<add user>
    NODEMAILER_PASSWORD=<add password>
```

    - Replace `<user>`, `<pass>`, and `<db>` with your MongoDB credentials and database name
    - Replace `JWT_SECRET` with a random string. You can generate a random 32 character string from the terminal by typing:
      - node  <enter>;
      - then type
        - require('crypto').randomBytes(32).toString('hex') <enter>`
    - Replace `SERVER_URL` with your server URL
    - CP_SECRET: Create a Cookie Parser secret and replace <> with your new secret
    - PORT: Add your port replace <>
    - NODEMAILER: Replace <> with actual Nodemailer data
      - (Port, User, and Password)

1. Review User.model.js - add/delete, as needed, according to your project
2. Review auth.routes.js and auth.controller.js - be sure anything added/removed from User.model is added/removed from routes and controller, as needed.
3. Test routes in Insomnia (or other API development platform)
    1. \*_See insomnia.config.json file and import into Insomnia_

## Features

-   [x] User Authentication
    -   [x] User Registration
    -   [x] User Login
    -   [x] User Logout
    -   [ ] User Profile
-   [ ] Template Model
    -   [ ] Create
    -   [ ] Read
    -   [ ] Update
    -   [ ] Delete
-   [ ] Template Controller
-   [ ] Template Routes

## TODO

-   [ ] Complete Auth
-   [ ] Complete Template Model / Controller / Routes
-   [ ] Create Insomnia Workspace for API Testing (or Postman) and add to repo
-   [ ] Comment All Code
-   [ ] Create Documentation (README.md)
-   [ ] Test All Routes
