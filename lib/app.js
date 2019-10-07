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
const otpConfig = require(OTP_CONFIG)
export default class TrimetWebapp extends Component {
  /**
   * Get branding ID from config file. Defaults to TriMet.
   */
  _getBranding = () => otpConfig.branding || 'trimet'

  _getCustomIcons = (branding) => {
    let icons
    switch (branding) {
      case 'trimet':
        icons = require('./icons/trimet')
        break
      default:
        icons = require('./icons')
        break
    }
    // This is a bit of a hack that I believe may be related to
    // https://stackoverflow.com/questions/43247696/javascript-require-vs-require-default
    if (icons.__esModule) return icons.default
    else return icons
  }

  /**
   * Get itinerary footer for specified branding ID.
   */
  _getItinFooter = branding => {
    switch (branding) {
      case 'trimet':
        return (
          <div className='disclaimer'>
            Before you go, check{' '}
            <a
              href='https://trimet.org/#/tracker/'
              target='_blank'>
              TransitTracker
            </a> for real-time arrival information and any Service Alerts that may
            affect your trip. You can also
            <a
              href='https://trimet.org/tools/transittracker-bytext.htm'
              target='_blank'>
              text your Stop ID to 27299
            </a> or call 503-238-RIDE (7433), option 1. Times and directions are for
            planning purposes only, and can be affected by traffic, road conditions,
            detours and other factors.
            <div className='link-row'>
              <a href='https://trimet.org/legal/index.htm' target='_blank'>
                Terms of Use
              </a> •{' '}
              <a href='https://trimet.org/legal/privacy.htm' target='_blank'>
                Privacy Policy
              </a>
            </div>
          </div>
        )
      default:
        return (
          <div className='disclaimer'>
            <div className='link-row'>
              <a href='#' target='_blank'>
                Terms of Use
              </a> •{' '}
              <a href='#' target='_blank'>
                Privacy Policy
              </a>
            </div>
          </div>
        )
    }
  }
  render () {
    console.log(this.props, OTP_CONFIG)
    const branding = this._getBranding()
    const customIcons = this._getCustomIcons(branding)
    const itineraryFooter = this._getItinFooter(branding)
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
