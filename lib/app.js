// import React/Redux libraries
import React, { Component } from 'react'

// import Bootstrap Grid components for layout
import { Navbar, Grid, Row, Col } from 'react-bootstrap'

// import OTP-RR components
import {
  DefaultMainPanel,
  LineItinerary,
  Map,
  MobileMain,
  ResponsiveWebapp,
  AppMenu
} from 'otp-react-redux'

// Loads a yaml config file which comes from a custom environment setting passed
// into webpack or defaults to ./config.yml
const otpConfig = require(OTP_CONFIG)

// Loads a JavaScript file to perform extra configuration setup
// FIXME figure out and document why it works to use a string template to load
// the config.js file
const jsConfig = require(`${otpConfig.jsConfigFile}`).configure(otpConfig)

const customIcons = {}
if (otpConfig.customIcons) {
  // Create a lookup of custom icons as specified in the config file
  Object.keys(otpConfig.customIcons).forEach(iconKey => {
    // FIXME this will cause webpack to load every single icon file in the icons
    //   directory. See https://webpack.js.org/guides/dependency-management/#require-with-expression
    //   Perhaps a better way to go would be to refactor out all of the icon
    //   images so that they are URLs to image files such that they don't increase
    //   the size of the js bundle.
    let Icon = require(`./icons/${otpConfig.customIcons[iconKey]}`)
    // This is a bit of a hack that I believe may be related to
    // https://stackoverflow.com/questions/43247696/javascript-require-vs-require-default
    if (Icon.__esModule) Icon = Icon.default
    customIcons[iconKey] = <Icon />
  })
}

if (jsConfig.applyCustomIconLogic) {
  jsConfig.applyCustomIconLogic(customIcons)
}

const itineraryFooter = jsConfig.getItineraryFooter && jsConfig.getItineraryFooter()

export default class TrimetWebapp extends Component {
  render () {
    const branding = {otpConfig}
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
              <DefaultMainPanel
                customIcons={customIcons}
                itineraryClass={LineItinerary}
                itineraryFooter={itineraryFooter}
              />
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
      <MobileMain
        map={(<Map />)}
        icons={customIcons}
        itineraryClass={LineItinerary}
        itineraryFooter={itineraryFooter}
        title={(<div className={`icon-${branding}`} />)}
      />
    )

    /** the main webapp **/
    return (
      <ResponsiveWebapp
        customIcons={customIcons}
        desktopView={desktopView}
        mobileView={mobileView}
      />
    )
  }
}
