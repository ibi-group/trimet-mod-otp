import React, { Component, PropTypes } from 'react'

import { NarrativeItinerary, OtpUtils } from 'otp-react-redux'

export default class TriMetItinerary extends NarrativeItinerary {

  _headerText () {
    const { itinerary } = this.props
    return 'Itinerary'
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
    return <LegSteps leg={leg} />
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
        <div className='header'>{this._headerText()}</div>
        <div className='itin-body'>
          {itinerary.legs.map((leg, i) => {
            return (<div>
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
      </div>
    )
  }
}


class LegSteps extends Component {

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
        {this.state.expanded
          ? <div className='steps'>
              {leg.steps.map((step, k) => {
                return <div className='step-row' key={k}>
                  {step.relativeDirection} on {step.streetName}
                </div>
              })}
            </div>
          : null
        }
      </div>
    )
  }
}

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
        {this.state.expanded
          ? <div className='intermediate-stops'>
              {leg.intermediateStops.map((stop, k) => {
                return <div className='stop-row' key={k} style={{ zIndex: 30, position: 'relative'}}>
                  <div className='stop-marker' style={{ float: 'left', marginLeft: '-17px', color: 'white' }}>&bull;</div>
                  <div className='stop-name'>{stop.name}</div>
                </div>
              })}
            </div>
          : null
        }
      </div>
    )
  }
}

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
    const { alerts } = this.props
    return (
      <div className='transit-alerts'>
        <div onClick={() => this._onHeaderClick()} className='header'>
          <i className='fa fa-exclamation-triangle' /> {alerts.length} alerts
          {' '}
          <i className={`fa fa-caret-${this.state.expanded ? 'up' : 'down'}`} />
        </div>
        {this.state.expanded
          ? <div>
              {alerts.map((alert, k) => {
                return <div key={k} className='transit-alert'>{alert.alertDescriptionText}</div>
              })}
            </div>
          : null
        }
      </div>
    )
  }
}
