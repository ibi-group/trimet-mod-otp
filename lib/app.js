// import necessary React/Redux libraries
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import FontAwesome from 'react-fontawesome'
import { VelocityTransitionGroup } from 'velocity-react'
import deepEqual from 'deep-equal'

// import Bootstrap Grid components for layout
import { Navbar, Grid, Row, Col, Button } from 'react-bootstrap'

// import OTP-RR components
import {
  BaseLayers,
  BaseMap,
  BikeRentalOverlay,
  DateTimeModal,
  DateTimePreview,
  EndpointsOverlay,
  ErrorMessage,
  ItineraryCarousel,
  ItineraryOverlay,
  LocationField,
  NarrativeRoutingResults,
  PlanTripButton,
  RoutesOverlay,
  SettingsPreview,
  SettingsSelectorPanel,
  StopsOverlay,
  SwitchButton,

  clearLocation,
  findNearbyStops,
  getCurrentPosition,
  otpUtils,
  setAutoPlan,
  setLocationToCurrent,
  setMapCenter
} from 'otp-react-redux'

import TriMetItinerary from './itinerary'

// enum-style object for different mobile screen states
const MobileScreens = {
  INITIAL_SET_LOCATION: 1,
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
    activeSearchId: PropTypes.number,
    browser: PropTypes.object,
    query: PropTypes.object,
    resultCount: PropTypes.number
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

    // check if device position changed (typically only set once, on initial page load)
    if (this.props.currentPosition !== nextProps.currentPosition) {
      const pt = {
        lat: nextProps.currentPosition.coords.latitude,
        lon: nextProps.currentPosition.coords.longitude
      }

      // update nearby stops
      this.props.findNearbyStops(pt)

      // if in mobile mode and from field is not set, use current location as from and recenter map
      if (this.state.mobileScreen !== null && this.props.query.from === null) {
        this.props.setLocationToCurrent('from')
        this.props.setMapCenter(pt)
      }
    }
  }

  componentDidMount () {
    this._newMediaType(null, true)
    this.props.getCurrentPosition()
  }

  /** Internal methods **/

  // called when switching between desktop and mobile modes
  _newMediaType (props, initialPageLoad) {
    props = props || this.props
    const mediaType = props.browser.mediaType
    if (mediaType === 'extraSmall') { // entering mobile mode
      if (initialPageLoad) this.setState({ mobileScreen: MobileScreens.INITIAL_SET_LOCATION })
      else this._updateMobileScreen(props)
      props.setAutoPlan(false)
    } else { // entering desktop mode
      this.setState({ mobileScreen: null })
      props.setAutoPlan(true)
    }
  }

  // called when props change in mobile mode, or when switching to mobile from desktop
  _updateMobileScreen (props) {
    const currentScreen = this.state.mobileScreen

    // determine new screen to transition to, if any. Defaults to Set Options screen
    let newScreen = MobileScreens.SET_OPTIONS

    // if we just got a trip plan result, transition to Results Summary screen
    if (this.props.searchPending && !props.searchPending) newScreen = MobileScreens.RESULTS_SUMMARY

    // do not update screen if still setting date/time or settings
    else if (currentScreen === MobileScreens.SET_DATETIME || currentScreen === MobileScreens.EXTENDED_SETTINGS) return

    else if (currentScreen === MobileScreens.SET_FROM_LOCATION || currentScreen === MobileScreens.SET_TO_LOCATION) return

    // do not update screen if still setting 'to' location on initial screen
    else if (currentScreen === MobileScreens.INITIAL_SET_LOCATION && props.query && !props.query.to) return

    if (newScreen !== currentScreen) { // if we're changing screens..
      // update the internal component state
      this.setState({ mobileScreen: newScreen })
    }
  }

  _showDateTimeScreen = () => this.setState({ mobileScreen: MobileScreens.SET_DATETIME })

  _showSettingsScreen = () => this.setState({ mobileScreen: MobileScreens.EXTENDED_SETTINGS })

  _mobileClosePressed () {
    switch (this.state.mobileScreen) {
      case MobileScreens.SET_DATETIME:
        this.setState({ mobileScreen: MobileScreens.SET_OPTIONS })
        break
      case MobileScreens.EXTENDED_SETTINGS:
        this.setState({ mobileScreen: MobileScreens.SET_OPTIONS })
        break
      case MobileScreens.SET_FROM_LOCATION:
      case MobileScreens.SET_TO_LOCATION:
        this.setState({ mobileScreen: MobileScreens.SET_OPTIONS })
        break
    }
  }

  render () {
    const { query, searchPending } = this.props

    /** shared components **/
    const map = (
      <BaseMap>
        <BikeRentalOverlay controlName='Bike Stations' />
        <ItineraryOverlay />
        <RoutesOverlay controlName='Transit Routes' />
        <EndpointsOverlay />
        <StopsOverlay controlName='Transit Stops' />
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
              <SearchForm showDateTime showSettings showSwitchButton />
              <ErrorMessage />
              <div className='desktop-narrative-container'>
                <NarrativeRoutingResults itineraryClass={TriMetItinerary} customIcons={customIcons} />
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
    let showBackButton = false
    let showClearButton = false
    let showPlanTripButtonPanel = false
    let headerText = null

    const onLocationFocused = (type) => {
      if (type === 'from') this.setState({ mobileScreen: MobileScreens.SET_FROM_LOCATION })
      if (type === 'to') this.setState({ mobileScreen: MobileScreens.SET_TO_LOCATION })
    }

    const locationsSummaryPanel = (
      <div className='locations-summary' style={{ padding: '4px 8px' }}>
        <div style={{ float: 'right' }}>
          <Button
            className='edit-search-button'
            onClick={() => { this.setState({ mobileScreen: MobileScreens.SET_OPTIONS }) }}
          >Edit</Button>
        </div>
        <div style={{ fontSize: '15px', lineHeight: '19px' }}>
          <div className='location'>
            <i className='fa fa-star' /> { query.from ? query.from.name : '' }
          </div>
          <div className='location' style={{ marginTop: '2px' }}>
            <i className='fa fa-map-marker' /> { query.to ? query.to.name : '' }
          </div>
        </div>
      </div>
    )

    const planTripButton = this.props.queryChanged || this.props.searchPending
      ? <PlanTripButton />
      : <Button className='view-results-button'
          onClick={() => { this.setState({ mobileScreen: MobileScreens.RESULTS_SUMMARY }) }}
        >
          View Trip Results
        </Button>

    /** Main switch statement for screen-specific layout **/

    switch (this.state.mobileScreen) {
      // initial set location screen with large map
      case MobileScreens.INITIAL_SET_LOCATION:
        mobileMapStyle.top = '110px'
        mobileTopPanel = <SearchForm
          showFrom={false}
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
            showClearButton={false}
          />
        </div>
        headerText = 'SET ORIGIN'
        mobileMapStyle.top = `${window.innerHeight}px`
        showBackButton = true
        showClearButton = true
        showPlanTripButtonPanel = true
        break

      // fullscreen set 'to' location
      case MobileScreens.SET_TO_LOCATION:
        mobileTopPanel = <div style={{ height: '100%' }}>
          <LocationField
            type='to'
            label='Enter destination...'
            static
            showClearButton={false}
          />
        </div>
        headerText = 'SET DESTINATION'
        mobileMapStyle.top = `${window.innerHeight}px`
        showBackButton = true
        showClearButton = true
        showPlanTripButtonPanel = true
        break

      // screen with expanded options (from/to/time/mode) and lower half-screen map
      case MobileScreens.SET_OPTIONS:
        headerText = 'PLAN TRIP'
        mobileMapStyle.top = '315px'
        mobileMapStyle.bottom = '0px'
        mobileTopPanel = <div>
          <SearchForm mobile
            showDateTime showDateTimeScreen={this._showDateTimeScreen}
            showSettings showSettingsScreen={this._showSettingsScreen}
            onLocationFocused={onLocationFocused}
            showSwitchButton
          />
          <div className='plan-trip-button-container'>
            {planTripButton}
          </div>
        </div>
        break

      case MobileScreens.EXTENDED_SETTINGS:
        headerText = 'SETTINGS'
        mobileTopPanel = <SettingsSelectorPanel />
        mobileMapStyle.top = `${window.innerHeight}px`
        showBackButton = true
        showPlanTripButtonPanel = true
        break

      case MobileScreens.SET_DATETIME:
        headerText = 'SET DATE & TIME'
        mobileMapStyle.top = `${window.innerHeight}px`
        mobileTopPanel = <DateTimeModal />
        showBackButton = true
        showPlanTripButtonPanel = true
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
      {/** Spinner **/}
      {searchPending &&
        <div className='spinner-overlay'><i className='fa fa-refresh fa-5x fa-spin' /></div>
      }

      {/** Top header bar **/}
      <Navbar fluid>

        <div className='mobile-back'>
          {showBackButton
            ? <FontAwesome name='arrow-left' onClick={() => { this._mobileClosePressed() }} />
            : <FontAwesome name='bars' onClick={this._menuButtonPressed} />
          }
        </div>

        <div className='mobile-header'>
          {(headerText !== null)
           ? <div className='mobile-header-text'>{headerText}</div>
           : <div className='icon-trimet' />
          }
        </div>

        {showClearButton
          ? <div className='mobile-close'>
              <Button className='clear-button'
                onClick={() => {
                  if (this.state.mobileScreen === MobileScreens.SET_FROM_LOCATION) {
                    this.props.clearLocation('from')
                  } else if (this.state.mobileScreen === MobileScreens.SET_TO_LOCATION) {
                    this.props.clearLocation('to')
                  }
                }}
              >Clear</Button>
            </div>
          : null
        }

        {showPlanTripButtonPanel
          ? <div className='plan-trip-button-panel plan-trip-button-container'>
              {planTripButton}
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
    showDateTime: PropTypes.bool,
    showFrom: PropTypes.bool,
    showSettings: PropTypes.bool,
    showTo: PropTypes.bool,
    showSwitchButton: PropTypes.bool,

    onLocationFocused: PropTypes.func,
    showDateTimeScreen: PropTypes.func,
    showSettingsScreen: PropTypes.func
  }

  static defaultProps = {
    showFrom: true,
    showTo: true
  }

  constructor () {
    super()
    this.state = {
      desktopDateTimeExpanded: false,
      desktopSettingsExpanded: false
    }
  }

  render () {
    const { onLocationFocused, showDateTime, showSettings, mobile } = this.props

    // define the location fields
    const fromLocationField = <LocationField
      type='from'
      label='Enter start location or click on map...'
      onClick={() => {
        if (typeof onLocationFocused === 'function') onLocationFocused('from')
      }}
      showClearButton={!mobile}
    />

    const toLocationField = <LocationField
      type='to'
      label='Enter destination or click on map...'
      onClick={() => {
        if (typeof onLocationFocused === 'function') onLocationFocused('to')
      }}
      showClearButton={!mobile}
    />

    return (
      <div>
        <div className='locations'>
          {this.props.showFrom && fromLocationField}
          {this.props.showTo && toLocationField}
          {this.props.showSwitchButton && <div className='switch-button-container'>
            <SwitchButton content={<i className='fa fa-exchange fa-rotate-90' />} />
          </div>}
        </div>

        {this.props.mobile
          ? <div style={{ padding: '0px 10px' }}> {/** mobile **/}
              <Row>
                {showDateTime && (
                  <Col xs={6} style={{ borderRight: '2px solid #ccc' }}>
                    <DateTimePreview onClick={this.props.showDateTimeScreen} compressed />
                  </Col>
                )}
                {showSettings && (
                  <Col xs={6}>
                    <SettingsPreview onClick={this.props.showSettingsScreen} icons={customIcons} compressed />
                  </Col>
                )}
              </Row>
            </div>
          : <div> {/** desktop **/}
              {showDateTime && (<div>
                <DateTimePreview caret={this.state.desktopDateTimeExpanded ? 'up' : 'down'}
                  onClick={() => { this.setState({ desktopDateTimeExpanded: !this.state.desktopDateTimeExpanded }) }}
                />
                <VelocityTransitionGroup enter={{animation: 'slideDown'}} leave={{animation: 'slideUp'}}>
                  {this.state.desktopDateTimeExpanded ? <DateTimeModal /> : null}
                </VelocityTransitionGroup>
              </div>)}
              {showSettings && (<div>
                <SettingsPreview icons={customIcons} caret={this.state.desktopSettingsExpanded ? 'up' : 'down'}
                  onClick={() => { this.setState({ desktopSettingsExpanded: !this.state.desktopSettingsExpanded }) }}
                />
                <VelocityTransitionGroup enter={{animation: 'slideDown'}} leave={{animation: 'slideUp'}}>
                  {this.state.desktopSettingsExpanded ? <SettingsSelectorPanel icons={customIcons} /> : null}
                </VelocityTransitionGroup>
              </div>)}
            </div>
        }
      </div>
    )
  }
}

// connect to the redux store
const mapStateToProps = (state, ownProps) => {
  const activeSearch = otpUtils.state.getActiveSearch(state.otp)
  return {
    browser: state.browser,
    currentPosition: state.otp.location.currentPosition,
    query: state.otp.currentQuery,
    activeSearchId: state.otp.activeSearchId,
    queryChanged: !deepEqual(
      activeSearch ? activeSearch.query : null,
      state.otp.currentQuery
    ),
    searchPending: activeSearch && activeSearch.pending,
    resultCount:
      activeSearch && activeSearch.response
        ? activeSearch.query.routingType === 'ITINERARY'
          ? activeSearch.response.plan
            ? activeSearch.response.plan.itineraries.length
            : 0
          : activeSearch.response.otp.profile.length
        : null
  }
}


const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    clearLocation: type => dispatch(clearLocation({ type })),
    setAutoPlan: autoPlan => dispatch(setAutoPlan({ autoPlan })),
    setLocationToCurrent: type => dispatch(setLocationToCurrent({ type })),
    setMapCenter: point => dispatch(setMapCenter(point)),
    findNearbyStops: params => dispatch(findNearbyStops(params)),
    getCurrentPosition: () => dispatch(getCurrentPosition())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TrimetWebapp)
