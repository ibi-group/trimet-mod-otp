// import necessary React/Redux libraries
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import FontAwesome from 'react-fontawesome'
import { VelocityTransitionGroup } from 'velocity-react'

// import Bootstrap Grid components for layout
import { Navbar, Grid, Row, Col } from 'react-bootstrap'

// import OTP-RR components
import {
  BikeRentalOverlay,
  EndpointsOverlay,
  ItineraryOverlay,
  ItineraryCarousel,
  LocationField,
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
import DateTimeModal from './date-time-modal'

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
  }

  componentDidMount () {
    this._newMediaType()
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

  _getDateString (query) {
    console.log(query)
    return 'now'
  }

  _showDateTimeScreen = () => this.setState({ mobileScreen: MobileScreens.SET_DATETIME })

  _mobileBackPressed = () => {
    switch (this.state.mobileScreen) {
      case MobileScreens.SET_OPTIONS:
        this.setState({ mobileScreen: MobileScreens.SET_LOCATION })
        break
      case MobileScreens.EXTENDED_SETTINGS:
        this.setState({ mobileScreen: MobileScreens.SET_OPTIONS })
        this.props.setShowExtendedSettings(false)
        break
      case MobileScreens.RESULTS_SUMMARY:
        if (this.state.mobileNarrativeExpanded) {
          this.setState({ mobileNarrativeExpanded: false })
        } else {
          this.setState({ mobileScreen: MobileScreens.SET_OPTIONS })
        }
        break
      case MobileScreens.SET_DATETIME:
        this.setState({ mobileScreen: MobileScreens.SET_OPTIONS })
        break
    }
  }

  componentWillReceiveProps (nextProps) {
    // check if were changing browser media types
    if (nextProps.browser.mediaType !== this.props.browser.mediaType) {
      this._newMediaType(nextProps)
    } else if (this.state.mobileScreen !== null) { // if already in mobile, check for screen update
      this._updateMobileScreen(nextProps)
    }

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
    let showBackArrow = true
    let headerText = null

    const onLocationFocused = (type) => {
      if(type === 'from') this.setState({ mobileScreen: MobileScreens.SET_FROM_LOCATION })
      if(type === 'to') this.setState({ mobileScreen: MobileScreens.SET_TO_LOCATION })
    }

    switch (this.state.mobileScreen) {
      // initial set location screen with large map
      case MobileScreens.SET_LOCATION:
        mobileMapStyle.top = '165px'
        mobileTopPanel = <SearchForm
          onLocationFocused={onLocationFocused}
        />
        showBackArrow = false
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
        break

      // screen with expanded options (from/to/time/mode) and lower half-screen map
      case MobileScreens.SET_OPTIONS:
        mobileMapStyle.top = '350px'
        mobileTopPanel = <SearchForm
          mobile
          showDateTimeScreen={this._showDateTimeScreen}
          showDateTimeOptions
          showSettingsBar
          showPlanTripButton
          onLocationFocused={onLocationFocused}
        />
        headerText = 'PLAN YOUR TRIP DETAILS'
        break

      case MobileScreens.EXTENDED_SETTINGS:
        mobileTopPanel = <SettingsSelectorPanel />
        mobileMapStyle.visibility = 'hidden'
        headerText = 'SETTINGS'
        break

      case MobileScreens.SET_DATETIME:
        mobileMapStyle.top = `${window.innerHeight}px`
        mobileTopPanel = <DateTimeModal />
        headerText = 'SET DATE & TIME'
        break

      case MobileScreens.RESULTS_SUMMARY:
        const narrativeHeight = this.state.mobileNarrativeExpanded ? 400 : 120
        mobileMapStyle.bottom = narrativeHeight
        if (!this.state.mobileNarrativeExpanded) {
          mobileTopPanel = <SearchForm />
          mobileMapStyle.top = '165px'
        }

        const narrativeContainerStyle = {
          height: narrativeHeight,
          'overflow-y': this.state.mobileNarrativeExpanded ? 'auto' : 'hidden'
        }

        mobileBottomPanel = (
          <div className='mobile-narrative-container' style={narrativeContainerStyle}>
            <ItineraryCarousel
              itineraryClass={TriMetItinerary}
              hideHeader
              onExpand={(isExpanded) => {
                this.setState({ mobileNarrativeExpanded: isExpanded })
              }}
            />
          </div>
        )

        headerText = this.state.mobileNarrativeExpanded
         ? 'TRIP DETAILS'
         : `WE FOUND ${this.props.resultCount} OPTION${this.props.resultCount > 1 ? 'S' : ''}`
        break
    }

    // main mobile layout assembly
    return (<div className='otp'>
      {/** Top header bar **/}
      <Navbar fluid>
        {showBackArrow
          ? <div className='mobile-back'>
              <FontAwesome name='arrow-left' onClick={this._mobileBackPressed} />
            </div>
          : null
        }
        <div className='mobile-header'>
          {(headerText !== null)
           ? <div className='mobile-header-text'>{headerText}</div>
           : <div className='icon-trimet' />
          }
        </div>
      </Navbar>
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
        {fromLocationField}
        {toLocationField}
        {this.props.showDateTimeOptions && this.props.mobile
          ? <button
            onClick={this.props.showDateTimeScreen}
            >now</button>
          : this.props.showDateTimeOptions
          ? <DateTimeSelector
            preview // TODO: add preview prop to DateTimeSelector to show the above
             />
          : null
        }
        {this.props.showSettingsBar
          ? <SettingsBar icons={customIcons} showCaret={this.props.showSettingsButtonCaret} />
          : null
        }
        <VelocityTransitionGroup enter={{animation: "slideDown"}} leave={{animation: "slideUp"}}>
          {this.props.showSettingsPanel
            ? <SettingsSelectorPanel icons={customIcons} />
            : null
          }
        </VelocityTransitionGroup>
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
