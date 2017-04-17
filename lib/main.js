// import necessary React/Redux libraries
import React from 'react'
import { render } from 'react-dom'
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import createLogger from 'redux-logger'
import { createResponsiveStateReducer, responsiveStoreEnhancer } from 'redux-responsive'

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
render(
  <Provider store={store}>
    <TrimetWebapp />
  </Provider>,
  document.getElementById('main')
)
