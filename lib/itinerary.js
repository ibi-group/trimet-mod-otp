import isEqual from 'lodash.isequal'
import React, { Component, PropTypes } from 'react'
import { VelocityTransitionGroup } from 'velocity-react'
import isMobile from 'is-mobile'
import {
  NarrativeItinerary,
  LegDiagramPreview,
  LocationIcon,
  TransportationNetworkCompanyLeg,
  TripDetails,
  TripTools,
  ViewStopButton,
  ViewTripButton,
  otpUtils
} from 'otp-react-redux'

import customIcons from './icons/index'
import StreetcarIcon from './icons/streetcar-icon'
import DirectionIcon from './direction-icon'

// TODO use pluralize that accounts for internationalization (and complex plurals, i.e., not just adding 's')
import {pluralize, toSentenceCase} from './util'

const defaultRouteColor = '#008'

export default class TriMetItinerary extends NarrativeItinerary {
  _headerText () {
    const { itinerary } = this.props
    return itinerary.summary || this._getSummary(itinerary)
  }

  _getSummary (itinerary) {
    let summary = ''
    let transitModes = []
    itinerary.legs.forEach((leg, index) => {
      if (otpUtils.itinerary.isTransit(leg.mode)) {
        const modeStr = getModeString(leg)
        if (transitModes.indexOf(modeStr) === -1) transitModes.push(modeStr)
      }
    })

    // check for access mode
    if (!otpUtils.itinerary.isTransit(itinerary.legs[0].mode)) {
      summary += getModeString(itinerary.legs[0])
    }

    // append transit modes, if applicable
    if (transitModes.length > 0) {
      summary += ' to ' + transitModes.join(', ')
    }

    return summary
  }

  render () {
    const {
      active,
      companies,
      expanded,
      itinerary,
      routingType
    } = this.props

    if (!itinerary) {
      return <div>No Itinerary!</div>
    }
    return (
      <div className='line-itin'>
        <div className='header' onClick={this._onHeaderClick}>
          <div className='itin-header-right'>
            {isMobile()
              ? expanded
                ? <span>Show Map <i className='fa fa-caret-down' /></span>
                : <span>Show Details <i className='fa fa-caret-up' /></span>
              : active
                ? (routingType === 'PROFILE' && <span><i className='fa fa-caret-up' /></span>)
                : <span><i className='fa fa-caret-down' /></span>
            }
          </div>
          {this._headerText()}
        </div>
        <ItinerarySummary companies={companies} itinerary={itinerary} />
        <VelocityTransitionGroup enter={{animation: 'slideDown'}} leave={{animation: 'slideUp'}}>
          {active || expanded ? <ItineraryBody {...this.props} itinerary={itinerary} /> : null}
        </VelocityTransitionGroup>
      </div>
    )
  }
}

class ItinerarySummary extends Component {
  static propTypes = {
    itinerary: PropTypes.object
  }

  render () {
    const { companies, itinerary } = this.props

    return (
      <div className='itin-summary'>
        <div className='details'>
          <div className='header'>{otpUtils.time.formatDuration(itinerary.duration)} total</div>
          <div className='detail'><i className='fa fa-clock-o' /> {otpUtils.time.formatDuration(itinerary.walkTime)} walking</div>
          <div className='detail'><i className='fa fa-clock-o' /> {otpUtils.time.formatDuration(itinerary.waitingTime)} waiting</div>
        </div>
        <div className='routes'>
          {itinerary.legs.filter(leg => {
            return leg.transitLeg || (leg.mode === 'CAR' && leg.hailedCar)
          }).map((leg, k) => {
            const longName = getRouteLongName(leg)
            const {isTNC, legMode} = getLegMode(companies, leg)
            return <div className='route-preview' key={k}>
              <div className='mode-icon'>
                {longName && longName.startsWith('Portland Streetcar')
                  ? <StreetcarIcon />
                  : otpUtils.itinerary.getModeIcon(legMode, customIcons)
                }
              </div>
              {!isTNC
                ? (
                  <div className='short-name' style={{ backgroundColor: getRouteColorForBadge(leg) }}>
                    {getRouteNameForBadge(leg)}
                  </div>
                )
                : (<div style={{ height: 30, overflow: 'hidden' }} />)
              }
            </div>
          })}
        </div>
      </div>
    )
  }
}

class ItineraryBody extends Component {
  static propTypes = {
    companies: PropTypes.string,
    itinerary: PropTypes.object,
    routingType: PropTypes.string
  }

  constructor (props) {
    super(props)
    this.rowKey = 0
  }

  shouldComponentUpdate (nextProps, nextState) {
    return !isEqual(this.props.companies, nextProps.companies) ||
      !isEqual(this.props.itinerary, nextProps.itinerary)
  }

  _createPlaceRow (place, type, time, leg, legIndex) {

  }

  render () {
    const { itinerary, companies } = this.props

    const rows = []
    itinerary.legs.forEach((leg, i) => {
      // Create a row containing the start place and leg details
      rows.push(<PlaceRow place={leg.from} time={leg.startTime} leg={leg} legIndex={i} companies={companies} />)
      if (i === itinerary.legs.length - 1) {
        rows.push(<PlaceRow place={leg.to} time={leg.endTime} />)
      }
    })

    return (
      <div className='itin-body'>
        {rows}
        <TripDetails itinerary={itinerary} />
        <TripTools itinerary={itinerary} />
      </div>
    )
  }
}

class PlaceRow extends Component {

  _createLegLine (leg) {
    switch (leg.mode) {
      case 'WALK': return <div className='leg-line leg-line-walk' />
      case 'BICYCLE':
      case 'BICYCLE_RENT':
        return <div className='leg-line leg-line-bicycle' />
      case 'CAR': return <div className='leg-line leg-line-car' />
      default:
        return <div className='leg-line leg-line-transit' style={{
          backgroundColor: leg.routeColor ? '#' + leg.routeColor : defaultRouteColor
        }} />
    }
  }

  render () {
    const { leg, legIndex, place, time } = this.props

    const stackIcon = (name, color, size) => <i className={`fa fa-${name} fa-stack-1x`} style={{ color, fontSize: size + 'px' }} />

    let icon
    if (!leg) { // This is the itinerary destination
      icon = (
        <span className='fa-stack place-icon-group'>
          {stackIcon('circle', 'white', 26)}
          <LocationIcon type='to' className='fa-stack-1x' style={{ fontSize: 20 }} />
        </span>
      )
    } else if (legIndex === 0) { // The is the origin
      icon = (
        <span className='fa-stack place-icon-group'>
          {stackIcon('circle', 'white', 26)}
          <LocationIcon type='from' className='fa-stack-1x' style={{ fontSize: 20 }} />
        </span>
      )
    } else { // This is an intermediate place
      icon = (
        <span className='fa-stack place-icon-group'>
          {stackIcon('circle', 'white', 22)}
          {stackIcon('circle-o', 'black', 22)}
        </span>
      )
    }

    const interline = leg && leg.interlineWithPreviousLeg

    return (
      <div className='place-row' key={this.rowKey++}>
        <div className='time'>
          {time && otpUtils.time.formatTime(time)}
        </div>
        <div className='line-container'>
          {leg && this._createLegLine(leg) }
          <div>{!interline && icon}</div>
        </div>
        <div className='place-details'>
          {/* Dot separating interlined segments, if applicable */}
          {interline && <div className='interline-dot'>&bull;</div>}

          {/* The place name */}
          <div className='place-name'>
            {interline
              ? <div className='interline-name'>Stay on Board at <b>{place.name}</b></div>
              : <div>{getPlaceName(place)}</div>
            }
          </div>

          {/* Place subheading: Transit stop */}
          {place.stopId && !interline && (
            <div className='place-subheader'>
              <span>Stop ID {place.stopId.split(':')[1]}</span>
              <ViewStopButton stopId={place.stopId} />
            </div>
          )}

          {/* Place subheading: TNC pickup */}
          {leg && leg.hailedCar && (
            <div className='place-subheader'>
              Wait X minutes for TNC pickup
            </div>
          )}

          {/* Place subheading: rented car pickup */}
          {leg && leg.rentedCar && (
            <div className='place-subheader'>
              Pick up {leg.from.networks ? leg.from.networks.join('/') : 'rented car'} {leg.from.name}
            </div>
          )}

          {/* Show the leg, if present */}
          {leg && (
            leg.transitLeg
              ? ( /* This is a transit leg */
                <TransitLegBody
                  leg={leg}
                  legIndex={legIndex}
                  setActiveLeg={this.props.setActiveLeg}
                />
              )
              : ( /* This is an access (e.g. walk/bike/etc.) leg */
                <AccessLegBody
                  leg={leg}
                  legIndex={legIndex}
                  legMode={getLegMode(this.props.companies, leg).legMode}
                  routingType={this.props.routingType}
                  setActiveLeg={this.props.setActiveLeg}
                />
              )
          )}
        </div>
      </div>
    )
  }
}

/* Access leg (walk/bike/drive) components */

class AccessLegBody extends Component {
  static propTypes = {
    leg: PropTypes.object,
    legMode: PropTypes.any,
    routingType: PropTypes.string
  }

  constructor (props) {
    super(props)
    this.state = { expanded: false }
  }

  _onStepsHeaderClick = () => {
    this.setState({ expanded: !this.state.expanded })
  }

  _onSummaryClick = () => {
    this.props.setActiveLeg(this.props.legIndex, this.props.leg)
  }

  render () {
    const { leg, legMode } = this.props
    const notation = legMode.mode === 'CAR_HAIL' ? '*' : ''
    return (
      <div className='leg-body'>
        <div className='summary' onClick={this._onSummaryClick}>
          {/* Mode-specific icon */}
          <div className='icon'>
            {otpUtils.itinerary.getModeIcon(legMode, customIcons)}
          </div>

          {/* Leg description, e.g. "Walk 0.5 mi toward..." */}
          <div>
            {getModeString(leg)}
            {' '}
            {leg.distance && <span> {otpUtils.distance.distanceString(leg.distance)} {notation}</span>}
            {` toward ${getPlaceName(leg.to)}`}
          </div>
          <div style={{clear: 'both'}} />
        </div>

        <div onClick={this._onStepsHeaderClick} className='steps-header'>
          {otpUtils.time.formatDuration(leg.duration)} {notation}
          {leg.steps && <span> <i className={`fa fa-caret-${this.state.expanded ? 'up' : 'down'}`} /></span>}
        </div>

        <VelocityTransitionGroup enter={{animation: 'slideDown'}} leave={{animation: 'slideUp'}}>
          {this.state.expanded && (
            legMode.mode === 'CAR_HAIL'
              ? <TransportationNetworkCompanyLeg leg={leg} legMode={legMode} />
              : <AccessLegSteps steps={leg.steps} />
          )}
        </VelocityTransitionGroup>
        {this.props.routingType === 'ITINERARY' && <LegDiagramPreview leg={leg} />}
      </div>
    )
  }
}

class AccessLegSteps extends Component {

  static propTypes = {
    steps: PropTypes.array
  }

  render () {
    return (
      <div className='steps'>
        {this.props.steps.map((step, k) => {
          return <div className='step-row' key={k}>
            <div style={{ width: 16, height: 16, float: 'left', fill: '#999999' }}>
              <DirectionIcon relativeDirection={step.relativeDirection} />
            </div>

            <div style={{ marginLeft: 24, lineHeight: 1.25, paddingTop: 1 }}>
              {getRelativeDirection(step.relativeDirection)}
              <span> on </span>
              <span style={{ fontWeight: 500 }}>
                {formatStreetName(step.streetName)}
              </span>
            </div>
          </div>
        })}
      </div>
    )
  }
}

function getRelativeDirection (relativeDirection) {
  switch (relativeDirection) {
    case 'CIRCLE_COUNTERCLOCKWISE': return 'Navigate traffic circle counterclockwise'
    case 'CIRCLE_CLOCKWISE': return 'Navigate traffic circle clockwise'
    case 'UTURN_LEFT': return 'U-turn left'
    case 'UTURN_RIGHT': return 'U-turn right'
  }
  return toSentenceCase(relativeDirection.replace('_', ' '))
}

function formatStreetName (streetName) {
  if (streetName === 'road') return 'Unnamed Road'
  if (streetName === 'path') return 'Unnamed Path'
  return streetName
}
/* Transit leg body + intermediate stops / alerts components */

class TransitLegBody extends Component {

  static propTypes = {
    leg: PropTypes.object,
    legIndex: PropTypes.number,
    setActiveLeg: PropTypes.func
  }

  constructor (props) {
    super(props)
    this.state = {
      alertsExpanded: false,
      stopsExpanded: false
    }
  }

  _onToggleStopsClick = () => {
    this.setState({ stopsExpanded: !this.state.stopsExpanded })
  }

  _onToggleAlertsClick = () => {
    this.setState({ alertsExpanded: !this.state.alertsExpanded })
  }

  _onSummaryClick = () => {
    this.props.setActiveLeg(this.props.legIndex, this.props.leg)
  }

  /* TODO: integrate into render() or make its own component */
  _createRouteName (mode, routeShortName, routeLongName, headsign, key) {
    return (<div key={key}>
      {/* Route Name/Badge row; clickable to set as active leg */}
      <div className='route-name'>
        <div className='icon'>
          {otpUtils.itinerary.getModeIcon(mode, customIcons)}
        </div>
        <div>
          {routeShortName && (
            <div style={{ float: 'left' }}>
              <span className='route-short-name'>{routeShortName}</span>
            </div>
          )}
          <div className='route-long-name'>
            {routeLongName}
            {headsign && <span> <span style={{ fontWeight: '200' }}>toward</span> {headsign}</span>}
          </div>
        </div>
        <div style={{ clear: 'both' }} />
      </div>
    </div>)
  }

  render () {
    const { leg } = this.props
    const { alerts, routes, mode, routeShortName, routeLongName, headsign } = leg
    const { alertsExpanded, stopsExpanded } = this.state

    return (
      <div className='leg-body'>
        {/* The Route Icon/Name Bar; clickable to set as active leg */}
        <div className='summary' onClick={this._onSummaryClick}>
          {routes
            ? routes.map((rte, i) => this._createRouteName(mode, rte.shortName, rte.longName, null, i))
            : this._createRouteName(mode, routeShortName, routeLongName, headsign)
          }
        </div>

        {/* Alerts toggle */}
        {alerts && alerts.length > 0 && (
          <div onClick={this._onToggleAlertsClick} className='transit-alerts-toggle'>
            <i className='fa fa-exclamation-triangle' /> {alerts.length} {pluralize('alert', alerts)}
            {' '}
            <i className={`fa fa-caret-${this.state.alertsExpanded ? 'up' : 'down'}`} />
          </div>
        )}

        {/* The Alerts body, if visible */}
        <VelocityTransitionGroup enter={{animation: 'slideDown'}} leave={{animation: 'slideUp'}}>
          {alertsExpanded && <AlertsBody alerts={leg.alerts} />}
        </VelocityTransitionGroup>

        {/* The "Ride X Min / X Stops" Row, including IntermediateStops body */}
        {leg.intermediateStops && leg.intermediateStops.length > 0 && (
          <div className='transit-leg-details'>

            {/* The header summary row, clickable to expand intermediate stops */}
            <div onClick={this._onToggleStopsClick} className='header'>
              {leg.duration && <span>Ride {otpUtils.time.formatDuration(leg.duration)}</span>}
              {leg.intermediateStops && (
                <span>
                  {' / '}
                  {leg.intermediateStops.length + 1}
                  {' stops '}
                  <i className={`fa fa-caret-${this.state.stopsExpanded ? 'up' : 'down'}`} />
                </span>
              )}

              {/* The ViewTripButton. TODO: make configurable */}
              <ViewTripButton
                tripId={leg.tripId}
                fromIndex={leg.from.stopIndex}
                toIndex={leg.to.stopIndex}
              />
            </div>

            {/* IntermediateStops expanded body */}
            <VelocityTransitionGroup enter={{animation: 'slideDown'}} leave={{animation: 'slideUp'}}>
              {stopsExpanded ? <IntermediateStops stops={leg.intermediateStops} /> : null }
            </VelocityTransitionGroup>

            {/* Average wait details, if present */}
            {leg.averageWait && <span>Typical Wait: {otpUtils.time.formatDuration(leg.averageWait)}</span>}
          </div>
        )}
      </div>
    )
  }
}

class IntermediateStops extends Component {
  static propTypes = {
    stops: PropTypes.array
  }

  render () {
    return (
      <div className='intermediate-stops'>
        {this.props.stops.map((stop, k) => {
          return <div className='stop-row' key={k}>
            <div className='stop-marker'>&bull;</div>
            <div className='stop-name'>{stop.name}</div>
          </div>
        })}
      </div>
    )
  }
}

class AlertsBody extends Component {
  static propTypes = {
    alerts: PropTypes.array
  }

  render () {
    return (
      <div className='transit-alerts'>
        {this.props.alerts.map((alert, k) => {
          return (
            <div key={k} className='transit-alert'>
              <div className='alert-icon'><i className='fa fa-exclamation-triangle' /></div>
              <div className='alert-body'>{alert.alertDescriptionText}</div>
            </div>
          )
        })}
      </div>
    )
  }
}

/* helper functions */

function getRouteNameForBadge (leg) {
  const shortName = leg.routes && leg.routes.length > 0
    ? leg.routes[0].shortName : leg.routeShortName

  const longName = getRouteLongName(leg)

  // check for max
  if (longName && longName.toLowerCase().startsWith('max')) return null

  // check for streetcar
  if (longName && longName.startsWith('Portland Streetcar')) return longName.split('-')[1].trim().split(' ')[0]

  return shortName || longName
}

function getRouteColorForBadge (leg) {
  return leg.routeColor ? '#' + leg.routeColor : defaultRouteColor
}

function getModeString (leg) {
  switch (leg.mode) {
    case 'BICYCLE_RENT': return 'Biketown'
    case 'CAR': return leg.hailedCar ? 'Ride' : 'Drive'
    case 'GONDOLA': return 'Aerial Tram'
    case 'TRAM':
      if(leg.routeLongName.toLowerCase().indexOf('streetcar') !== -1) return 'Streetcar'
      return 'Light Rail'
  }
  return toSentenceCase(leg.mode)
}

function getPlaceName (place) {
  // If address is provided (i.e. for carshare station, use it)
  return place.address ? place.address.split(',')[0] : place.name
}

function getRouteLongName (leg) {
  return leg.routes && leg.routes.length > 0
    ? leg.routes[0].longName
    : leg.routeLongName
}

// Temporary hack for getting TNC details
function getLegMode (companies, leg) {
  let legMode = leg.mode
  let isTNC = false
  if (legMode === 'CAR' && leg.rentedCar) {
    legMode = {
      mode: 'CAR_RENT'
    }
  } else if (legMode === 'CAR' && companies) {
    legMode = {
      label: companies,
      mode: 'CAR_HAIL'
    }
    isTNC = true
  }

  return {
    legMode,
    isTNC
  }
}
