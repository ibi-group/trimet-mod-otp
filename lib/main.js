// import necessary React/Redux libraries
import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import createLogger from 'redux-logger'
import { createResponsiveStateReducer, responsiveStoreEnhancer } from 'redux-responsive'
import { AppContainer } from 'react-hot-loader'

// import OTP-RR components
import { createOtpReducer } from 'otp-react-redux'

import TrimetWebapp from './app'

// load the OTP configuration
const otpConfig = require('json-loader!yaml-loader!./config.yml')

// set up the Redux store
const store = createStore(
  combineReducers({
    otp: createOtpReducer(otpConfig), // add optional initial query here
    browser: createResponsiveStateReducer()
  }),
  compose(
    responsiveStoreEnhancer,
    applyMiddleware(thunk, createLogger())
  )
)

// render the app
const render = App => ReactDOM.render(
  <Provider store={store}>
    <AppContainer>
      <App />
    </AppContainer>
  </Provider>,
  document.getElementById('main')
)

render(TrimetWebapp)

// set up hot reloading
if (module.hot) {
  module.hot.accept('./app', () => render(TrimetWebapp))
}