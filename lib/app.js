// import necessary React/Redux libraries
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import FontAwesome from 'react-fontawesome'
import { VelocityTransitionGroup } from 'velocity-react'

// import Bootstrap Grid components for layout
import { Navbar, Grid, Row, Col, Button } from 'react-bootstrap'

// import OTP-RR components
import {
  BikeRentalOverlay,
  EndpointsOverlay,
  ItineraryOverlay,
  ItineraryCarousel,
  LocationField,
  DateTimePreview,
  DateTimeModal,
  DateTimeSelector,
  NarrativeItineraries,
  BaseMap,
  BaseLayers,
  PlanTripButton,
  SettingsBar,
  SettingsSelectorPanel,
  ErrorMessage,

  setAutoPlan,
  setShowExtendedSettings,
  findNearbyStops,
  getCurrentPosition
} from 'otp-react-redux'

import TriMetItinerary from './itinerary'
import BiketownIcon from './icons/biketown-icon'

// enum-style object for different mobile screen states
const MobileScreens = {
  SET_LOCATION: 1,
  SET_FROM_LOCATION: 2,
  SET_TO_LOCATION: 3,
  SET_OPTIONS: 4,
  EXTENDED_SETTINGS: 5,
  SET_DATETIME: 6,
  RESULTS_SUMMARY: 7,
  RESULTS_DETAILS: 8
}

import customIcons from './icons/index'

class TrimetWebapp extends Component {
  static propTypes = {
    activeSearch: PropTypes.number,
    browser: PropTypes.object,
    query: PropTypes.object,
    resultCount: PropTypes.number,
    ui: PropTypes.object
  }

  /** Lifecycle methods **/

  constructor () {
    super()
    this.state = {
      mobileScreen: null,
      mobileNarrativeExpanded: false
    }
  }

  componentWillReceiveProps (nextProps) {
    // check if were changing browser media types
    if (nextProps.browser.mediaType !== this.props.browser.mediaType) {
      this._newMediaType(nextProps)
    } else if (this.state.mobileScreen !== null) { // if already in mobile, check for screen update
      this._updateMobileScreen(nextProps)
    }

    // check if the Settings button was pressed in mobile mode
    if(nextProps.browser.mediaType === 'extraSmall' && nextProps.ui.showExtendedSettings) {
      this.setState({ mobileScreen: MobileScreens.EXTENDED_SETTINGS })
    }

    // check if device position changed; update nearvy stops if so
    if (this.props.currentPosition !== nextProps.currentPosition) {
      this.props.findNearbyStops({
        lat: nextProps.currentPosition.coords.latitude,
        lon: nextProps.currentPosition.coords.longitude
      })
    }
  }

  componentDidMount () {
    this._newMediaType()
    this.props.getCurrentPosition()
  }

  /** Internal methods **/

  _newMediaType (props) {
    props = props || this.props
    const mediaType = props.browser.mediaType
    if (mediaType === 'extraSmall') { // entering mobile mode
      this._updateMobileScreen(props)
      props.setAutoPlan(false)
    } else { // entering desktop mode
      this.setState({ mobileScreen: null })
      props.setAutoPlan(true)
    }
  }

  _updateMobileScreen (props) {
    const neitherLocationSet = props.query &&
      props.query.from === null && props.query.to === null
    const hasSearchResults = props.activeSearch !== null

    // determine which screen we're in
    let newScreen = null
    if (this.state.mobileScreen === MobileScreens.SET_DATETIME) return // do not update screen if still setting date/time
    else if (neitherLocationSet) newScreen = MobileScreens.SET_LOCATION
    else if (!hasSearchResults) newScreen = MobileScreens.SET_OPTIONS
    else newScreen = MobileScreens.RESULTS_SUMMARY

    if (newScreen !== this.state.mobileScreen) { // if we're changing screens..
      // update the internal component state
      this.setState({ mobileScreen: newScreen })
    }
  }

  _showDateTimeScreen = () => this.setState({ mobileScreen: MobileScreens.SET_DATETIME })

  _mobileClosePressed () {
    switch (this.state.mobileScreen) {
      case MobileScreens.SET_DATETIME:
        this.setState({ mobileScreen: MobileScreens.SET_OPTIONS })
        break
      case MobileScreens.EXTENDED_SETTINGS:
        this.setState({ mobileScreen: MobileScreens.SET_OPTIONS })
        this.props.setShowExtendedSettings(false)
        break
      case MobileScreens.SET_FROM_LOCATION:
      case MobileScreens.SET_TO_LOCATION:
        this.setState({ mobileScreen: MobileScreens.SET_OPTIONS })
        break
    }
  }

  render () {
    /** shared components **/
    const map = (
      <BaseMap>
        <BaseLayers />
        <BikeRentalOverlay />
        <ItineraryOverlay />
        <EndpointsOverlay />
      </BaseMap>
    )

    /** desktop view **/
    if (this.state.mobileScreen === null) {
      return (<div className='otp'>
        <Navbar fluid>
          <Navbar.Brand>
            <div>
              <div className='icon-trimet' />
            </div>
          </Navbar.Brand>
        </Navbar>
        <Grid>
          <Row className='main-row'>
            <Col sm={6} md={4} className='sidebar'>
              <SearchForm
                showDateTimeOptions
                showSettingsBar
                showSettingsButtonCaret
                showSettingsPanel={this.props.ui.showExtendedSettings}
                showPlanTripButton
              />
              <ErrorMessage />
              <div className='desktop-narrative-container'>
                <NarrativeItineraries itineraryClass={TriMetItinerary} />
              </div>
            </Col>

            <Col sm={6} md={8} className='map-container'>
              {map}
            </Col>
          </Row>
        </Grid>
      </div>)
    }

    /** mobile view **/

    const mobileMapStyle = {}
    let mobileTopPanel = null
    let mobileBottomPanel = null
    let showCloseButton = false
    let headerText = null

    const onLocationFocused = (type) => {
      if(type === 'from') this.setState({ mobileScreen: MobileScreens.SET_FROM_LOCATION })
      if(type === 'to') this.setState({ mobileScreen: MobileScreens.SET_TO_LOCATION })
    }

    const { query } = this.props
    const locationsSummaryPanel = (
      <div className='locations-summary' style={{ padding: '4px 8px' }}>
        <div style={{ float: 'right' }}>
          <Button
            className='edit-search-button'
            onClick={() => { this.setState({ mobileScreen: MobileScreens.SET_OPTIONS }) }}
          >Edit Search</Button>
        </div>
        <div style={{ fontSize: '15px', lineHeight: '19px' }}>
          <i className='fa fa-star' /> { query.from ? query.from.name : '' }<br />
          <i className='fa fa-map-marker' /> { query.to ? query.to.name : '' }
        </div>
      </div>
    )

    /** Main switch statement for screen-specific layout **/

    switch (this.state.mobileScreen) {
      // initial set location screen with large map
      case MobileScreens.SET_LOCATION:
        mobileMapStyle.top = '165px'
        mobileTopPanel = <SearchForm
          onLocationFocused={onLocationFocused}
        />
        break

      // fullscreen set 'from' location
      case MobileScreens.SET_FROM_LOCATION:
        mobileTopPanel = <div style={{ height: '100%' }}>
          <LocationField
            type='from'
            label='Enter start location...'
            static
          />
        </div>
        mobileMapStyle.visibility = 'hidden'
        showCloseButton = true
        break

      // fullscreen set 'to' location
      case MobileScreens.SET_TO_LOCATION:
        mobileTopPanel = <div style={{ height: '100%' }}>
          <LocationField
            type='to'
            label='Enter destination...'
            static
          />
        </div>
        mobileMapStyle.visibility = 'hidden'
        showCloseButton = true
        break

      // screen with expanded options (from/to/time/mode) and lower half-screen map
      case MobileScreens.SET_OPTIONS:
        headerText = 'PLAN YOUR TRIP DETAILS'
        mobileMapStyle.top = '290px'
        mobileMapStyle.bottom = '40px'
        mobileTopPanel = <SearchForm
          mobile
          showDateTimeScreen={this._showDateTimeScreen}
          showDateTimeOptions
          showSettingsBar
          onLocationFocused={onLocationFocused}
        />
        mobileBottomPanel = (
          <div className='mobile-bottom-button-container'>
            <PlanTripButton />
          </div>
        )
        break

      case MobileScreens.EXTENDED_SETTINGS:
        headerText = 'SETTINGS'
        mobileTopPanel = <SettingsSelectorPanel />
        mobileMapStyle.visibility = 'hidden'
        showCloseButton = true
        break

      case MobileScreens.SET_DATETIME:
        headerText = 'SET DATE & TIME'
        mobileMapStyle.top = `${window.innerHeight}px`
        mobileTopPanel = <DateTimeModal />
        showCloseButton = true
        break

      case MobileScreens.RESULTS_SUMMARY:
        headerText = `WE FOUND ${this.props.resultCount} OPTION${this.props.resultCount > 1 ? 'S' : ''}`

        mobileTopPanel = locationsSummaryPanel
        mobileMapStyle.top = 100
        mobileMapStyle.bottom = 120

        mobileBottomPanel = (
          <div className='mobile-narrative-container' style={{ height: 120, overflowY: 'hidden' }}>
            <ItineraryCarousel
              itineraryClass={TriMetItinerary}
              hideHeader
              onClick={() => { this.setState({ mobileScreen: MobileScreens.RESULTS_DETAILS }) }}
            />
          </div>
        )
        break

      case MobileScreens.RESULTS_DETAILS:
        headerText = 'TRIP DETAILS'
        mobileTopPanel = locationsSummaryPanel
        mobileMapStyle.visibility = 'hidden'

        mobileBottomPanel = (
          <div className='mobile-narrative-container' style={{ top: 100, overflowY: 'auto' }}>
            <ItineraryCarousel
              itineraryClass={TriMetItinerary}
              hideHeader
              expanded
              onClick={() => { this.setState({ mobileScreen: MobileScreens.RESULTS_SUMMARY }) }}
            />
          </div>
        )

        break
    }

    // main mobile layout assembly
    return (<div className='otp'>
      {/** Top header bar **/}
      <Navbar fluid>

        <div className='mobile-back'>
          <FontAwesome name='bars' onClick={this._menuButtonPressed} />
        </div>

        <div className='mobile-header'>
          {(headerText !== null)
           ? <div className='mobile-header-text'>{headerText}</div>
           : <div className='icon-trimet' />
          }
        </div>

        {showCloseButton
          ? <div className='mobile-close'>
              <FontAwesome name='times' onClick={() => {
                this._mobileClosePressed()}} />
            </div>
          : null
        }
      </Navbar>

      {/** Main content area **/}
      <Grid>
        <Row className='main-row'>
          <Col className='sidebar'>
            {mobileTopPanel}
            <div className='mobile-map-container' style={mobileMapStyle}>{map}</div>
            {mobileBottomPanel}
          </Col>
        </Row>
      </Grid>
    </div>)
  }
}

/** SearchForm **/

class SearchForm extends Component {
  static propTypes = {
    mobile: PropTypes.bool,
    showDateTimeOptions: PropTypes.bool,
    showSettingsBar: PropTypes.bool,
    showSettingsButtonCaret: PropTypes.bool,
    showSettingsPanel: PropTypes.bool,
    showModeOptions: PropTypes.bool,
    showPlanTripButton: PropTypes.bool,
    onLocationFocused: PropTypes.func
  }

  render () {
    const { onLocationFocused } = this.props

    // define the location fields
    const fromLocationField = <LocationField
      type='from'
      label='Enter start location or click on map...'
      onClick={() => {
        if (typeof onLocationFocused === 'function') onLocationFocused('from')
      }}
    />

    const toLocationField = <LocationField
      type='to'
      label='Enter destination or click on map...'
      onClick={() => {
        if (typeof onLocationFocused === 'function') onLocationFocused('to')
      }}
    />

    return (
      <div>
        <div className='locations'>
          {fromLocationField}
          {toLocationField}
        </div>

        {this.props.mobile
          ? <div style={{ padding: '10px' }}> {/** mobile **/}
              <Row>
                <Col xs={6} style={{ borderRight: '2px solid #ccc'}}>
                  <DateTimePreview onClick={this.props.showDateTimeScreen} />
                </Col>
                <Col xs={6} style={{ }}>
                  <SettingsBar icons={customIcons} showCaret={this.props.showSettingsButtonCaret} compressed />
                </Col>
              </Row>
            </div>
          : <div> {/** desktop **/}
              desktop
              <SettingsBar icons={customIcons} showCaret={this.props.showSettingsButtonCaret} />
              <VelocityTransitionGroup enter={{animation: "slideDown"}} leave={{animation: "slideUp"}}>
                {this.props.showSettingsPanel
                  ? <SettingsSelectorPanel icons={customIcons} />
                  : null
                }
              </VelocityTransitionGroup>
            </div>
        }

        {this.props.showPlanTripButton
          ? <PlanTripButton text='SEARCH' />
          : null
        }
      </div>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    browser: state.browser,
    currentPosition: state.otp.location.currentPosition,
    query: state.otp.currentQuery,
    activeSearch: state.otp.activeSearch,
    resultCount: state.otp.searches.length > 0 && state.otp.searches[state.otp.activeSearch]
      ? state.otp.searches[state.otp.activeSearch].planResponse.plan.itineraries.length
      : null,
    ui: state.otp.ui
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setAutoPlan: autoPlan => dispatch(setAutoPlan({ autoPlan })),
    setShowExtendedSettings: showExtendedSettings => dispatch(setShowExtendedSettings({ showExtendedSettings })),
    findNearbyStops: params => dispatch(findNearbyStops(params)),
    setAutoPlan: autoPlan => dispatch(setAutoPlan({ autoPlan })),
    getCurrentPosition: () => dispatch(getCurrentPosition())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TrimetWebapp)
