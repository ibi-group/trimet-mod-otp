// import React/Redux libraries
import React, { Component } from 'react'
// import Bootstrap Grid components for layout
import { Grid, Row, Col } from 'react-bootstrap'

// import OTP-RR components
import {
  DefaultMainPanel,
  DesktopNav,
  LineItinerary,
  Map,
  MobileMain,
  ResponsiveWebapp
} from 'otp-react-redux'

// Loads a yaml config file which is set in the webpack.config.js file. This
// setting is defined from a custom environment setting passed into webpack or
// defaults to ./config.yml
const otpConfig = require(YAML_CONFIG)

// Loads a JavaScript file which is set in the webpack.config.js file. This
// setting is defined from a custom environment setting passed into webpack or
// defaults to ./config.js
const jsConfig = require(JS_CONFIG).configure(otpConfig)

const {getItineraryFooter, LegIcon, ModeIcon} = jsConfig

if (!LegIcon || !ModeIcon) {
  throw new Error('LegIcon and ModeIcon must be defined in config.js')
}
const itineraryFooter = typeof getItineraryFooter === 'function'
  ? getItineraryFooter()
  : null

export default class TrimetWebapp extends Component {
  render () {
    const {branding} = otpConfig
    /** desktop view **/
    const desktopView = (
      <div className='otp'>
        <DesktopNav />
        <Grid>
          <Row className='main-row'>
            <Col sm={6} md={4} className='sidebar'>
              {/* <main> is needed for accessibility checks. */}
              <main>
                <DefaultMainPanel
                  itineraryClass={LineItinerary}
                  itineraryFooter={itineraryFooter}
                  LegIcon={LegIcon}
                  ModeIcon={ModeIcon}
                />
              </main>
            </Col>
            <Col sm={6} md={8} className='map-container'>
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
          itineraryFooter={itineraryFooter}
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
