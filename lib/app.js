// import necessary React/Redux libraries
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import FontAwesome from 'react-fontawesome'

// import Bootstrap Grid components for layout
import { Navbar, Grid, Row, Col } from 'react-bootstrap'

// import OTP-RR components
import {
  BikeRentalOverlay,
  EndpointsOverlay,
  ItineraryOverlay,
  ItineraryCarousel,
  LocationField,
  ModeSelector,
  DateTimeSelector,
  NarrativeItineraries,
  BaseMap,
  BaseLayers,
  PlanTripButton,
  ErrorMessage,
  setAutoPlan
} from 'otp-react-redux'

// enum-style object for different mobile screen states
const MobileScreens = {
  SET_LOCATION: 1,
  SET_OPTIONS: 2,
  RESULTS_SUMMARY: 3,
  RESULTS_DETAILS: 4
}

class TrimetWebapp extends Component {
  static propTypes = {
    activeSearch: PropTypes.number,
    browser: PropTypes.object,
    query: PropTypes.object,
    resultCount: PropTypes.number
  }

  constructor () {
    super()
    this.state = {
      mobileScreen: null,
      mobileNarrativeExpanded: false
    }
  }

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
    const locationsAreSet = props.query &&
      this.props.query.from != null && props.query.to != null
    const hasSearchResults = props.activeSearch !== null

    // determine which screen we're in
    let newScreen = null
    if (!locationsAreSet) newScreen = MobileScreens.SET_LOCATION
    else if (!hasSearchResults) newScreen = MobileScreens.SET_OPTIONS
    else newScreen = MobileScreens.RESULTS_SUMMARY

    if (newScreen !== this.state.mobileScreen) { // if we're changing screens..
      // update the internal component state
      this.setState({ mobileScreen: newScreen })
    }
  }

  _mobileBackPressed () {
    switch (this.state.mobileScreen) {
      case MobileScreens.SET_OPTIONS:
        this.setState({ mobileScreen: MobileScreens.SET_LOCATION })
        break
      case MobileScreens.RESULTS_SUMMARY:
        if (this.state.mobileNarrativeExpanded) {
          this.setState({ mobileNarrativeExpanded: false })
        } else {
          this.setState({ mobileScreen: MobileScreens.SET_OPTIONS })
        }
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
  }

  componentDidMount () {
    this._newMediaType()
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
                showModeOptions
                showPlanTripButton
              />
              <ErrorMessage />
              <NarrativeItineraries />
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

    switch (this.state.mobileScreen) {
      case MobileScreens.SET_LOCATION:
        mobileMapStyle.top = '165px'
        mobileTopPanel = <SearchForm />
        showBackArrow = false
        break

      case MobileScreens.SET_OPTIONS:
        mobileMapStyle.top = '350px'
        mobileTopPanel = <SearchForm
          showDateTimeOptions
          showModeOptions
          showPlanTripButton
        />
        headerText = 'PLAN YOUR TRIP DETAILS'
        break

      case MobileScreens.RESULTS_SUMMARY:
        const narrativeHeight = this.state.mobileNarrativeExpanded ? 400 : 94
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

    return (<div className='otp'>
      <Navbar fluid>
        {showBackArrow
          ? <div className='mobile-back'>
              <FontAwesome name='arrow-left' onClick={() => this._mobileBackPressed()} />
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

class SearchForm extends Component {
  static propTypes = {
    showDateTimeOptions: PropTypes.boolean,
    showModeOptions: PropTypes.boolean,
    showPlanTripButton: PropTypes.boolean
  }

  render () {
    // define the location fields
    const fromLocationField = <LocationField
      type='from'
      label='Enter start location or click on map...'
    />

    const toLocationField = <LocationField
      type='to'
      label='Enter destination or click on map...'
    />

    return (
      <div>
        {fromLocationField}
        {toLocationField}
        {this.props.showDateTimeOptions
          ? <DateTimeSelector />
          : null
        }
        {this.props.showModeOptions
          ? <ModeSelector showLabel={false} />
          : null
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
    query: state.otp.currentQuery,
    activeSearch: state.otp.activeSearch,
    resultCount: state.otp.searches.length > 0 && state.otp.searches[state.otp.activeSearch]
      ? state.otp.searches[state.otp.activeSearch].planResponse.plan.itineraries.length
      : null
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setAutoPlan: autoPlan => dispatch(setAutoPlan({ autoPlan }))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TrimetWebapp)
