import React, { Component, PropTypes } from 'react'
import { VelocityTransitionGroup } from 'velocity-react'

import { NarrativeItinerary, OtpUtils } from 'otp-react-redux'

export default class TriMetItinerary extends NarrativeItinerary {

  _headerText () {
    const { itinerary } = this.props
    return 'Itinerary'
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
        <div className='header' onClick={this._onHeaderClick}>{this._headerText()}</div>
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
          <div className='header'>{OtpUtils.time.formatDuration(itinerary.duration)} total</div>
          <div className='detail'><i className='fa fa-clock-o' /> {OtpUtils.time.formatDuration(itinerary.walkTime)} walking</div>
          <div className='detail'><i className='fa fa-clock-o' /> {OtpUtils.time.formatDuration(itinerary.waitingTime)} waiting</div>
        </div>
        <div className='routes'>
          {itinerary.legs.filter(leg => leg.transitLeg).map((leg, k) => {
            return (<div className='route-preview' key={k}>
              <div className='mode-icon' />
              <div className='short-name'>{leg.routeShortName || leg.routeLongName}</div>
            </div>)
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
      <div className='time'>{OtpUtils.time.formatTime(time)}</div>
      <div className='place-icon-container'>{icons[type]}</div>
      <div className='place-name'>{place.name}</div>
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
        return <div className='leg-line-transit' style={{ backgroundColor: OtpUtils.itinerary.getMapColor(leg.mode) }} />
    }
  }

  _createLegBody (leg) {
    if (leg.transitLeg) {
      return <div>
        <div className='route-name'>
          {leg.routeShortName
            ? <span className='route-short-name'>{leg.routeShortName}</span>
            : null
          }
          <strong>{leg.routeLongName}</strong> toward <strong>{leg.headsign}</strong>
        </div>
        <TransitLegDetails leg={leg} />
        {leg.alerts && leg.alerts.length > 0
          ? <Alerts alerts={leg.alerts} />
          : null
        }
      </div>
    }
    return <AccessLegBody leg={leg} />
  }

  render () {
    const { itinerary } = this.props
    return (
      <div className='itin-body'>
        {itinerary.legs.map((leg, i) => {
          return (<div key={i}>
            {this._createPlaceRow(leg.from, i === 0 ? 'from' : 'transit', leg.startTime)}
            <div style={{ position: 'relative' }}>
              <div className='leg-mode'>
                <div className='icon' />
              </div>
              <div className='leg-line-container'>{this._createLegLine(leg)}</div>
              <div className='leg-body'>{this._createLegBody(leg)}</div>
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
      <div className=''>
        <div onClick={() => this._onHeaderClick()} className='header'>
          {leg.mode} {OtpUtils.time.formatDuration(leg.duration)} / {OtpUtils.distance.distanceString(leg.distance)}
          {' '}
          <i className={`fa fa-caret-${this.state.expanded ? 'up' : 'down'}`} />
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
            {step.relativeDirection} on {step.streetName}
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
      <div className='transit-leg-details'>
        <div onClick={() => this._onHeaderClick()} className='header'>
          Travel {OtpUtils.time.formatDuration(leg.duration)} / {leg.intermediateStops.length + 1} stops
          {' '}
          <i className={`fa fa-caret-${this.state.expanded ? 'up' : 'down'}`} />
        </div>
        <VelocityTransitionGroup enter={{animation: "slideDown"}} leave={{animation: "slideUp"}}>
          {this.state.expanded ? <IntermediateStops stops={leg.intermediateStops} /> : null }
        </VelocityTransitionGroup>
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
    return (
      <div className='transit-alerts'>
        <div onClick={() => this._onHeaderClick()} className='header'>
          <i className='fa fa-exclamation-triangle' /> {this.props.alerts.length} alerts
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
