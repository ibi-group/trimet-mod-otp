// import this polyfill in order to make webapp compatible with IE 11
import 'es6-math'

import { hot } from 'react-hot-loader/root'

// import necessary React/Redux libraries
import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import createLogger from 'redux-logger'
import ReactGA from 'react-ga'

// import OTP-RR components
import { createOtpReducer, otpUtils } from 'otp-react-redux'
import { createHashHistory } from 'history'
import { connectRouter, routerMiddleware } from 'connected-react-router'

// Auth0
import { Auth0Provider } from 'use-auth0-hooks'
const { getAuth0Callbacks, getAuth0Config, getAuthRedirectUri } = otpUtils.auth
const AUTH0_SCOPE = ''

// CSS imports
import 'otp-react-redux/dist/index.css'
import 'leaflet.polylinemeasure/Leaflet.PolylineMeasure.css'

import TrimetWebapp from './app'

// load the OTP configuration
const otpConfig = require(YAML_CONFIG)
// const { whyDidYouUpdate } = require('why-did-you-update')
// whyDidYouUpdate(React)

// const initialQuery = {
//   from: {
//     lat: 45.5246,
//     lon: -122.6710
//   },
//   to: {
//     lat: 45.5307,
//     lon: -122.6647
//   },
//   type: 'ITINERARY'
// }

const history = createHashHistory()

const middleware = [
  thunk,
  routerMiddleware(history) // for dispatching history actions
]

// check if webpack is being ran in development mode. If so, enable redux-logger
if (process.env.NODE_ENV === 'development') {
  middleware.push(createLogger())
}

// set up the Redux store
const store = createStore(
  combineReducers({
    otp: createOtpReducer(otpConfig),
    router: connectRouter(history) // add optional initial query here
  }),
  compose(applyMiddleware(...middleware))
)

// Auth0 config and callbacks.
const auth0Config = getAuth0Config(otpConfig)
const auth0Callbacks = getAuth0Callbacks(store)

const innerProvider = App => (
  <Provider store={store}>
    <App />
  </Provider>
)

// render the app
const render = App => ReactDOM.render(
  auth0Config
  ? (<Auth0Provider
      audience={auth0Config.audience}
      scope={AUTH0_SCOPE}
      domain={auth0Config.domain}
      clientId={auth0Config.clientId}
      redirectUri={getAuthRedirectUri()}
      {...auth0Callbacks}
    >
      {innerProvider(App)}
    </Auth0Provider>)
  : innerProvider(App),

  document.getElementById('main')
)

// The package react-hot-loader package says that it is fine to use the tool in
// production mode: https://www.npmjs.com/package/react-hot-loader#install
//
// "Note: You can safely install react-hot-loader as a regular dependency
// instead of a dev dependency as it automatically ensures it is not executed in
// production and the footprint is minimal."
//
// There have been some issues noticed with changing font-awesome icons while
// react-hot-loader is enabled. A refresh of the page/build script may be
// necessary in rare occasions.
// See https://github.com/ibi-group/trimet-mod-otp/pull/207
hot(
  render(TrimetWebapp)
)

// analytics
if (otpConfig.analytics && otpConfig.analytics.google) {
  ReactGA.initialize(otpConfig.analytics.google.globalSiteTag)
  ReactGA.pageview(window.location.pathname + window.location.search)
}
