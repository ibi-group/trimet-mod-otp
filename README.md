# trimet-mod-otp

TriMet-specific implementation of the [otp-react-redux](https://github.com/opentripplanner/otp-react-redux) library, managed using Yarn and Webpack 4.

## Setup and Configuration Instructions

1. Ensure that [Yarn](https://yarnpkg.com/en/) (v1.9+) and [Node.js](https://nodejs.org/en/) (v8.9+) are installed locally.

2. Clone the trimet-mod-otp repository:

```bash
git clone https://github.com/conveyal/trimet-mod-otp.git
```

3. Install dependencies using Yarn:

```bash
yarn install
```

4. Update the configuration file, `lib/config.yml`, as needed. This file allows for configuration of the OTP API, map base layers and overlays, enabled travel modes, and other settings. See `config.yml` comments for details.

5. If a custom page title is desired, update the `<title>` contents in `lib/index.tpl.html`.

## To Run a Local Test Server:

Run the `start` command with Yarn to deploy the application locally for testing. This command uses [webpack-dev-server](https://github.com/webpack/webpack-dev-server) and deploys to `http://localhost:8080`:

```bash
yarn start
```

## To Build a Production Bundle for Deployment

Run the `build` command with Yarn to bundle the application for production deployment. This command uses webpack running in production mode and produces minified/optimized code:

```bash
yarn build
```

This will build three files in the `dist/` directory: `index.html`, `bundle.js`, and `styles.css`. These files can then be deployed to any public-facing web server.
