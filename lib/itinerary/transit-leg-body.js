import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { VelocityTransitionGroup } from 'velocity-react'

import { ViewTripButton, otpUtils } from 'otp-react-redux'

import customIcons from '../icons/index'

// TODO use pluralize that for internationalization (and complex plurals, i.e., not just adding 's')
import { pluralize } from '../util'

export default class TransitLegBody extends Component {

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
    return (
      <div key={key} className='route-name leg-description'> {/* Route Name/Badge row; clickable to set as active leg */}
        <div>
          <div className='icon'>{otpUtils.itinerary.getModeIcon(mode, customIcons)}</div>
        </div>
        {routeShortName && (
          <div>
            <span className='route-short-name'>{routeShortName}</span>
          </div>
        )}
        <div className='route-long-name'>
          {routeLongName}
          {headsign && <span> <span style={{ fontWeight: '200' }}>to</span> {headsign}</span>}
        </div>
      </div>
    )
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
