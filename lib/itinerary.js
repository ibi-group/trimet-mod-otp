import React, { Component, PropTypes } from 'react'
import { VelocityTransitionGroup } from 'velocity-react'

import { NarrativeItinerary, ViewStopButton, ViewTripButton, otpUtils } from 'otp-react-redux'

import customIcons from './icons/index'
import StreetcarIcon from './icons/streetcar-icon'

// TODO use pluralize that accounts for internationalization (and complex plurals, i.e., not just adding 's')
import {pluralize, toSentenceCase} from './util'

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
      activeLeg,
      activeStep,
      expanded,
      index,
      itinerary,
      setActiveLeg,
      setActiveStep
    } = this.props

    return (
      <div className='line-itin'>
        <div className='header' onClick={this._onHeaderClick}>
          <div className='itin-header-right'>
            {expanded
              ? <span>Show Map <i className='fa fa-caret-down' /></span>
              : <span>Show Details <i className='fa fa-caret-up' /></span>
            }
          </div>
          {this._headerText()}
        </div>
        <ItinerarySummary itinerary={itinerary} />
        <VelocityTransitionGroup enter={{animation: "slideDown"}} leave={{animation: "slideUp"}}>
          {active || expanded ? <ItineraryBody itinerary={itinerary} /> : null}
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
    const { itinerary } = this.props

    return (
      <div className='itin-summary'>
        <div style={{ position: 'absolute', left: 0 }}>
          <div className='header'>{otpUtils.time.formatDuration(itinerary.duration)} total</div>
          <div className='detail'><i className='fa fa-clock-o' /> {otpUtils.time.formatDuration(itinerary.walkTime)} walking</div>
          <div className='detail'><i className='fa fa-clock-o' /> {otpUtils.time.formatDuration(itinerary.waitingTime)} waiting</div>
        </div>
        <div className='routes'>
          {itinerary.legs.filter(leg => leg.transitLeg).map((leg, k) => {
            const longName = getRouteLongName(leg)
            return <div className='route-preview' key={k}>
              <div className='mode-icon'>{
                longName && longName.startsWith('Portland Streetcar')
                  ? <StreetcarIcon />
                  : otpUtils.itinerary.getModeIcon(leg.mode, customIcons)
              }</div>
              <div className='short-name' style={{ backgroundColor: getRouteColorForBadge(leg) }}>
                {getRouteNameForBadge(leg)}
              </div>
            </div>
          })}
        </div>
      </div>
    )
  }
}

class ItineraryBody extends Component {
  static propTypes = {
    itinerary: PropTypes.object
  }

  _createPlaceRow (place, type, time) {
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

    return <div style={{ position: 'relative' }}>
      <div className='time'>{time && otpUtils.time.formatTime(time)}</div>
      <div className='place-icon-container'>{icons[type]}</div>
      <div className='place-name'>
        {place.name}{' '}
        {type === 'transit' && <ViewStopButton stopId={place.stopId} />}
      </div>
      <div style={{ clear: 'both' }} />
    </div>
  }

  _createLegLine (leg) {
    switch (leg.mode) {
      case 'WALK': return <div className='leg-line-walk' />
      case 'BICYCLE':
      case 'BICYCLE_RENT':
        return <div className='leg-line-bicycle' />
      default:
        return <div className='leg-line-transit' style={{ backgroundColor: otpUtils.itinerary.getMapColor(leg.mode) }} />
    }
  }

  _createLegBody (leg) {
    if (leg.transitLeg) {
      return <div className='leg-body'>
        {leg.routes
          ? leg.routes.map((rte, i) => this._createRouteName(leg.mode, rte.shortName, rte.longName, null, i))
          : this._createRouteName(leg.mode, leg.routeShortName, leg.routeLongName, leg.headsign)
        }
        <TransitLegDetails leg={leg} />
        {leg.alerts && leg.alerts.length > 0
          ? <Alerts alerts={leg.alerts} />
          : null
        }
      </div>
    }
    return <AccessLegBody leg={leg} />
  }

  _createRouteName (mode, routeShortName, routeLongName, headsign, key) {
    return <div className='route-name' key={key}>
      <div className='icon'>
        {otpUtils.itinerary.getModeIcon(mode, customIcons)}
      </div>
      <div>
        {routeShortName
          ? <span className='route-short-name'>{routeShortName}</span>
          : null
        }
        <strong>{routeLongName}</strong>
        {headsign && <span> toward <strong>{headsign}</strong></span>}
      </div>
    </div>
  }

  render () {
    const { itinerary } = this.props
    return (
      <div className='itin-body'>
        {itinerary.legs.map((leg, i) => {
          return (<div key={i}>
            {this._createPlaceRow(leg.from, i === 0 ? 'from' : 'transit', leg.startTime)}
            <div style={{ position: 'relative' }}>
              <div className='leg-line-container'>{this._createLegLine(leg)}</div>
              {this._createLegBody(leg)}
              <div style={{ clear: 'both' }} />
            </div>
            {i == itinerary.legs.length - 1
              ? this._createPlaceRow(leg.to, 'to', leg.endTime)
              : null
            }
          </div>)
        })}
      </div>
    )
  }
}

/* Access leg (walk/bike/drive) components */

class AccessLegBody extends Component {
  static propTypes = {
    leg: PropTypes.object
  }

  constructor (props) {
    super(props)
    this.state = { expanded: false }
  }

  _onHeaderClick () {
    this.setState({ expanded: !this.state.expanded })
  }

  render () {
    const { leg } = this.props
    return (
      <div className='leg-body'>
        <div onClick={() => this._onHeaderClick()} className='header'>
          <div className='icon'>
            {otpUtils.itinerary.getModeIcon(leg.mode, customIcons)}
          </div>
          {toSentenceCase(leg.mode)} {otpUtils.time.formatDuration(leg.duration)}
          {leg.distance && <span> / {otpUtils.distance.distanceString(leg.distance)}</span>}
          {leg.steps && <span> <i className={`fa fa-caret-${this.state.expanded ? 'up' : 'down'}`} /></span>}
        </div>
        <VelocityTransitionGroup enter={{animation: "slideDown"}} leave={{animation: "slideUp"}}>
          {this.state.expanded ? <AccessLegSteps steps={leg.steps} /> : null }
        </VelocityTransitionGroup>
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

/* Transit leg details + intermediate stops components */

class TransitLegDetails extends Component {

  static propTypes = {
    leg: PropTypes.object
  }

  constructor (props) {
    super(props)
    this.state = { expanded: false }
  }

  _onHeaderClick () {
    this.setState({ expanded: !this.state.expanded })
  }

  render () {
    const { leg } = this.props
    return (
      <div>
        <div className='transit-leg-details'>
          <div onClick={() => this._onHeaderClick()} className='header'>
            {leg.duration && <span>Ride {otpUtils.time.formatDuration(leg.duration)}</span>}
            {leg.intermediateStops && <span> / {leg.intermediateStops.length + 1} stops <i className={`fa fa-caret-${this.state.expanded ? 'up' : 'down'}`} /></span>}
          </div>
          <VelocityTransitionGroup enter={{animation: "slideDown"}} leave={{animation: "slideUp"}}>
            {this.state.expanded ? <IntermediateStops stops={leg.intermediateStops} /> : null }
          </VelocityTransitionGroup>
          {leg.averageWait && <span>Typical Wait: {otpUtils.time.formatDuration(leg.averageWait)}</span>}
        </div>
        <div style={{ fontStyle: 'normal' }}>
          <ViewTripButton
            tripId={leg.tripId}
            fromIndex={leg.from.stopIndex}
            toIndex={leg.to.stopIndex}
          />
        </div>
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

/* Alerts components */

class Alerts extends Component {
  static propTypes = {
    alerts: PropTypes.array
  }

  constructor (props) {
    super(props)
    this.state = { expanded: false }
  }

  _onHeaderClick () {
    this.setState({ expanded: !this.state.expanded })
  }

  render () {
    const {alerts} = this.props
    return (
      <div className='transit-alerts'>
        <div onClick={() => this._onHeaderClick()} className='header'>
          <i className='fa fa-exclamation-triangle' /> {alerts.length} {pluralize('alert', alerts)}
          {' '}
          <i className={`fa fa-caret-${this.state.expanded ? 'up' : 'down'}`} />
        </div>
        <VelocityTransitionGroup enter={{animation: "slideDown"}} leave={{animation: "slideUp"}}>
          {this.state.expanded ? <AlertsBody {...this.props} /> : null }
        </VelocityTransitionGroup>
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
      <div>
        {this.props.alerts.map((alert, k) => {
          return <div key={k} className='transit-alert'>{alert.alertDescriptionText}</div>
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
  const longName = getRouteLongName(leg).toLowerCase()

  // check for max
  if (longName && longName.startsWith('max')) {
    if (longName.indexOf('red') !== -1) return '#d31f43'
    if (longName.indexOf('orange') !== -1) return '#d25d13'
    if (longName.indexOf('green') !== -1) return '#028953'
    if (longName.indexOf('blue') !== -1) return '#0f6aac'
    if (longName.indexOf('yellow') !== -1) return '#ffc524'
  }

  return '#0f6aac'
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
