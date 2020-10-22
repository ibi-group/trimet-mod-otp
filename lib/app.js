// import React/Redux libraries
import React, { Component } from 'react'
// import Bootstrap Grid components for layout
import { Navbar, Grid, Row, Col } from 'react-bootstrap'
// import OTP-RR components
import {
  LineItinerary,
  Map,
  MobileMain,
  ResponsiveWebapp,
  AppMenu
} from 'otp-react-redux'

// Loads a yaml config file which is set in the webpack.config.js file. This
// setting is defined from a custom environment setting passed into webpack or
// defaults to ./config.yml
const otpConfig = require(YAML_CONFIG)

// Loads a JavaScript file which is set in the webpack.config.js file. This
// setting is defined from a custom environment setting passed into webpack or
// defaults to ./config.js
const jsConfig = require(JS_CONFIG).configure(otpConfig)

const {
  getItineraryFooter,
  getContainerSlot,
  getMapContainerSlot,
  getMainPanel,
  LegIcon,
  ModeIcon
} = jsConfig

// Helper method to get component if the getMethod param is a valid function
const getComponentIfExists = (getMethod) => {
  return typeof getMethod === 'function'
    ? getMethod()
    : null
}

const mainPanel = getComponentIfExists(getMainPanel)
// Main panel and Leg/Mode icons are required.
if (!mainPanel || !LegIcon || !ModeIcon) {
  throw new Error('getMainPanel, LegIcon, and ModeIcon must be defined in config.js')
}
export default class TrimetWebapp extends Component {
  render () {
    const {branding} = otpConfig
    /** desktop view **/
    const desktopView = (
      <div className='otp'>
        <Navbar>
          <Navbar.Header>
            <Navbar.Brand>
              <div className='app-menu-container'>
                <AppMenu />
              </div>
              <div
                className={`icon-${branding}`}
                // This style is applied here because it is only intended for
                // desktop view.
                style={{ marginLeft: 50 }} />
            </Navbar.Brand>
          </Navbar.Header>
        </Navbar>
        <Grid>
          <Row className='main-row'>
            <Col sm={6} md={4} className='sidebar'>
              {/* <main> is needed for accessibility checks. */}
              <main>
                {mainPanel}
              </main>
            </Col>
            {getComponentIfExists(getContainerSlot)}
            <Col sm={6} md={8} className='map-container'>
              {getComponentIfExists(getMapContainerSlot)}
              <Map />
            </Col>
          </Row>
        </Grid>
      </div>
    )

    /** mobile view **/
    const mobileView = (
      // <main> is needed for accessibility checks.
      <main>
        <MobileMain
          map={(<Map />)}
          itineraryClass={LineItinerary}
          itineraryFooter={getComponentIfExists(getItineraryFooter)}
          LegIcon={LegIcon}
          ModeIcon={ModeIcon}
          title={(<div className={`icon-${branding}`} />)}
        />
      </main>
    )

    /** the main webapp **/
    return (
      <ResponsiveWebapp
        desktopView={desktopView}
        // Pass the LegIcon here for use in the print view.
        LegIcon={LegIcon}
        mobileView={mobileView}
      />
    )
  }
}
