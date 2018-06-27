# trimet-mod-otp

TriMet specific implementation of the otp-react-redux library.

General Requirements:

  - [Git](https://git-scm.com)
  - [Node JS 6](https://nodejs.org)
  - [Yarn](https://yarnpkg.com)
  - [Webpack 2](https://webpack.github.io)
  - [Webpack Dev Server](https://www.npmjs.com/package/webpack-dev-server) (for testing only)

## Development Instructions

Install Node JS *6.x* LTS via [nvm](https://github.com/creationix/nvm).

This is  suitable for a non-root user on Mac OS X or Linux.  If you are running windows please install all of the requirements above manually instead.

Note: Please don't run a "curl-pipe-bash" command on a production server.

```bash
# Install Node Version Manager
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash

# Close and re-open your terminal as instructed in the output.

# Install Node JS and Yarn
nvm install v6.14.3
nvm use v6.14.3
nvm alias default v6.14.3
npm install -g yarn
which node && which npm && which yarn

# Clone this repository into your workspace
git clone https://github.com/conveyal/trimet-mod-otp.git
cd trimet-mod-opt && pwd

# Checkout develop (create a feature branch from develop to make changes)
git checkout develop

# Yarn install project dependencies
yarn install

# Start a webpack development server
yarn start
```

See console output for local URL and webpack details.

webpack-dev-server command line options can be passed to ```yarn start```.

Start hacking.  Please see the documentation for webpack-dev-server via the requirements link above.


## Deployment Instructions

The following instructions will help generate a build suitable for deployment to a static web server.

1. Follow the development instructions above to create your functional workspace.
1. Run ```yarn build --output-public-path /mymap``` from inside the project directory to run webpack.
1. Upload the contents of the generated "dist" directory to your static web server.

Webpack command line options can be passed to ```yarn build```.

See [webpack command line options](https://webpack.js.org/api/cli/) to customize artifact generation.
