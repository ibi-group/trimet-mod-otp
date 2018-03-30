import isEqual from 'lodash.isequal'
import React, { Component, PropTypes } from 'react'
import { VelocityTransitionGroup } from 'velocity-react'
import isMobile from 'is-mobile'
import {
  NarrativeItinerary,
  LegDiagramPreview,
  TransportationNetworkCompanyLeg,
  TripDetails,
  TripTools,
  ViewStopButton,
  ViewTripButton,
  otpUtils
} from 'otp-react-redux'

import customIcons from './icons/index'
import StreetcarIcon from './icons/streetcar-icon'

// TODO use pluralize that accounts for internationalization (and complex plurals, i.e., not just adding 's')
import {pluralize, toSentenceCase} from './util'

const defaultRouteColor = '#0f6aac'

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
    itinerary: PropTypes.object
  }

  constructor (props) {
    super(props)
    this.rowKey = 0
  }

  shouldComponentUpdate (nextProps, nextState) {
    return !isEqual(this.props.companies, nextProps.companies) ||
      !isEqual(this.props.itinerary, nextProps.itinerary)
  }

  _createPlaceRow (place, type, time, nextLeg) {
    const stackIcon = (name, color, size) => <i className={`fa fa-${name} fa-stack-1x`} style={{ color, fontSize: size + 'px' }} />

    const icons = {
      'transit': (
        <span className='fa-stack place-icon-group'>
          {stackIcon('circle', 'white', 22)}
          {stackIcon('circle-o', 'black', 22)}
        </span>
      ),
      'from': (
        <span className='fa-stack place-icon-group'>
          {stackIcon('circle', 'white', 24)}
          {stackIcon('star', '#8ec449', 18)}
        </span>
      ),
      'to': (
        <span className='fa-stack place-icon-group'>
          {stackIcon('circle', 'white', 24)}
          {stackIcon('map-marker', '#f5a81c', 22)}
        </span>
      )
    }

    const interline = nextLeg && nextLeg.interlineWithPreviousLeg
    return (
      <div className='place-row' key={this.rowKey++}>
        <div className='time'>{time && otpUtils.time.formatTime(time)}</div>
        <div className='line-container'>
          {nextLeg && this._createLegLine(nextLeg) }
          <div>{!interline && icons[type]}</div>
        </div>
        <div className='place-details'>
          {interline && <div className='interline-dot'>&bull;</div>}
          <div className='place-name'>
            {type === 'transit' && !interline && (
              <div className='viewer-button-container'>

              </div>
            )}
            {interline
              ? <div className='interline-name'>Stay on Board at <b>{place.name}</b></div>
              : <div>{place.name}</div>
            }
          </div>
          {type === 'transit' && !interline && place.stopId && (
            <div className='stop-details'>
              <span>Stop ID {place.stopId.split(':')[1]}</span>
              <ViewStopButton stopId={place.stopId} />
            </div>
          )}
          {nextLeg && this._createLegBody(nextLeg)}
        </div>
      </div>
    )
  }

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

  _createLegBody (leg) {
    if (leg.transitLeg) return <TransitLegBody leg={leg} />
    const {legMode} = getLegMode(this.props.companies, leg)
    return <AccessLegBody leg={leg} legMode={legMode} />
  }

  render () {
    const { itinerary } = this.props

    const rows = []
    itinerary.legs.forEach((leg, i) => {
      // Create a row containing the start place and leg details
      rows.push(this._createPlaceRow(
        leg.from,
        i === 0 ? 'from' : 'transit',
        leg.startTime,
        leg
      ))

      // For the last leg only, create a row containing the end place */}
      if (i === itinerary.legs.length - 1) {
        rows.push(this._createPlaceRow(leg.to, 'to', leg.endTime))
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

/* Access leg (walk/bike/drive) components */

class AccessLegBody extends Component {
  static propTypes = {
    leg: PropTypes.object,
    legMode: PropTypes.any
  }

  constructor (props) {
    super(props)
    this.state = { expanded: false }
  }

  _onHeaderClick () {
    this.setState({ expanded: !this.state.expanded })
  }

  render () {
    const { leg, legMode } = this.props
    const notation = legMode.mode === 'CAR_HAIL' ? '*' : ''
    return (
      <div className='leg-body'>
        <div className='header'>
          <div className='icon'>
            {otpUtils.itinerary.getModeIcon(legMode, customIcons)}
          </div>
          <div>
            {toSentenceCase(leg.mode)}
            {' '}
            {leg.distance && <span> {otpUtils.distance.distanceString(leg.distance)} {notation}</span>}
            {` toward ${leg.to.name}`}
          </div>
          <div style={{clear: 'both'}} />
        </div>

        <div onClick={() => this._onHeaderClick()} className='steps-header'>
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
        <LegDiagramPreview leg={leg} />
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
            {toSentenceCase(step.relativeDirection)} on {step.streetName}
          </div>
        })}
      </div>
    )
  }
}


/* Transit leg body + intermediate stops / alerts components */

class TransitLegBody extends Component {

  static propTypes = {
    leg: PropTypes.object
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

  /* TODO: integrate into render() or make its own component */
  _createRouteName (mode, routeShortName, routeLongName, headsign, alerts, key) {
    return <div className='route-name' key={key}>
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
          {alerts && alerts.length > 0 && (
            <div onClick={this._onToggleAlertsClick} className='transit-alerts-toggle'>
              <i className='fa fa-exclamation-triangle' /> {alerts.length} {pluralize('alert', alerts)}
              {' '}
              <i className={`fa fa-caret-${this.state.alertsExpanded ? 'up' : 'down'}`} />
            </div>
          )}
        </div>
      </div>
      <div style={{ clear: 'both' }} />
    </div>
  }

  render () {
    const { leg } = this.props
    const { alertsExpanded, stopsExpanded } = this.state

    return (
      <div className='leg-body'>
        {/* The Route Icon/Name Bar. (Includes Alerts Toggle, if applicable) */}
        {leg.routes
          ? leg.routes.map((rte, i) => this._createRouteName(leg.mode, rte.shortName, rte.longName, null, null, i))
          : this._createRouteName(leg.mode, leg.routeShortName, leg.routeLongName, leg.headsign, leg.alerts)
        }

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
    case 'CAR': return 'Drive'
    case 'GONDOLA': return 'Aerial Tram'
    case 'TRAM':
      if(leg.routeLongName.toLowerCase().indexOf('streetcar') !== -1) return 'Streetcar'
      return 'Light Rail'
  }
  return toSentenceCase(leg.mode)
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
  if (legMode === 'CAR' && companies) {
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
