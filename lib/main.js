// import necessary React/Redux libraries
import React, { Component } from 'react'
import { render } from 'react-dom'
import { createStore, combineReducers, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import createLogger from 'redux-logger'

// import Bootstrap Grid components for layout
import { Navbar, Grid, Row, Col } from 'react-bootstrap'

// import OTP-RR components
import {
  EndpointsOverlay,
  ItineraryOverlay,
  LocationField,
  ModeSelector,
  DateTimeSelector,
  NarrativeItineraries,
  BaseMap,
  BaseLayers,
  PlanTripButton,
  createOtpReducer,
  ErrorMessage
} from 'otp-react-redux'

// load the OTP configuration
const otpConfig = require('json-loader!yaml-loader!./config.yml')

// set up the Redux store
const store = createStore(
  combineReducers({
    otp: createOtpReducer(otpConfig) // add optional initial query here
    // add your own reducers if you want
  }),
  applyMiddleware(thunk, createLogger())
)

// define a simple responsive UI using Bootstrap and OTP-RR
class OtpRRExample extends Component {
  render () {
    return (<div className='otp'>
      <Navbar fluid>
        <Navbar.Brand>
          <div>
            <div className='icon-trimet' />
          </div>
        </Navbar.Brand>
      </Navbar>
      <Grid fluid>
        <Row>
          <Col xs={12} md={4} className='sidebar'>
            <LocationField type='from' label='Enter start location or click on map...' />
            <LocationField type='to' label='Enter destination or click on map...' />
            <ModeSelector />
            <DateTimeSelector />
            <ErrorMessage />
            <PlanTripButton />
            <NarrativeItineraries />
          </Col>

          <Col xsHidden md={8} className='map-container'>
            <BaseMap>
              <BaseLayers />
              <ItineraryOverlay />
              <EndpointsOverlay />
            </BaseMap>
          </Col>
        </Row>
      </Grid>
    </div>)
  }
}

// render the app
render(
  <Provider store={store}>
    <OtpRRExample />
  </Provider>,
  document.getElementById('main')
)
