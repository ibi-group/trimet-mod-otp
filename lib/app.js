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

import customIcons from './icons/index'

export default class TrimetWebapp extends Component {
  render () {

    const itineraryFooter = (
      <div className='disclaimer'>
        Before you go, check <a href='https://trimet.org/#/tracker/' target='_blank'>TransitTracker</a> for real-time arrival information and any Service Alerts that may affect your trip. You can also <a href='https://trimet.org/tools/transittracker-bytext.htm' target='_blank'>text your Stop ID to 27299</a> or call 503-238-RIDE (7433), option 1. Times and directions are for planning purposes only, and can be affected by traffic, road conditions, detours and other factors.
        <div className='link-row'>
          <a href='https://trimet.org/legal/index.htm' target='_blank'>Terms of Use</a> • <a href='https://trimet.org/legal/privacy.htm' target='_blank'>Privacy Policy</a>
        </div>
      </div>
    )

    /** desktop view **/
    const desktopView = (
      <div className='otp'>
        <Navbar>
          <Navbar.Header>
            <Navbar.Brand>
              <div style={{ float: 'left', color: 'white', fontSize: 28, paddingTop: 4 }}>
                <AppMenu />
              </div>
              <div className='icon-trimet' style={{ marginLeft: 50 }} />
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

            <Col sm={6} md={8} className='map-container'><Map /></Col>
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
        title={(<div className='icon-trimet' />)}
      />
    )

    /** the main webapp **/
    return (
      <ResponsiveWebapp
        desktopView={desktopView}
        mobileView={mobileView}
      />
    )
  }
}
