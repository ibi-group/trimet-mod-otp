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

const initialQuery = {
  from: {
    lat: 45.52763694452676,
    lon: -122.69754409790039,
    name: '2246 Northwest Irving Street, Portland, OR, USA 97210'
  },
  to: {
    lat: 45.50718903318443,
    lon: -122.63694763183595,
    name: '2827 Southeast Grant Street, Portland, OR, USA 97214'
  },
  type: 'PROFILE'
}

// set up the Redux store
const store = createStore(
  combineReducers({
    otp: createOtpReducer(otpConfig), //, initialQuery), // add optional initial query here
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
