// import React/Redux libraries
import React, { Component } from 'react'

// import Bootstrap Grid components for layout
import { Navbar, Grid, Row, Col } from 'react-bootstrap'

// import OTP-RR components
import {
  DefaultSearchForm,
  ErrorMessage,
  Map,
  MobileMain,
  NarrativeRoutingResults,
  ResponsiveWebapp,
  ViewerContainer,
  AppMenu
} from 'otp-react-redux'

import TriMetItinerary from './itinerary'

import customIcons from './icons/index'

export default class TrimetWebapp extends Component {
  render () {
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
              <ViewerContainer>
                <DefaultSearchForm icons={customIcons} />
                <ErrorMessage />
                <div className='desktop-narrative-container'>
                  <NarrativeRoutingResults itineraryClass={TriMetItinerary} customIcons={customIcons} />
                </div>
              </ViewerContainer>
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
        itineraryClass={TriMetItinerary}
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
