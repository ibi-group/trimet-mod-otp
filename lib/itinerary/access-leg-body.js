import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { VelocityTransitionGroup } from 'velocity-react'

import {
  LegDiagramPreview,
  TransportationNetworkCompanyLeg,
  otpUtils
} from 'otp-react-redux'

import customIcons from '../icons/index'
import DirectionIcon from '../direction-icon'

export default class AccessLegBody extends Component {
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
            {otpUtils.itinerary.getLegModeString(leg)}
            {' '}
            {leg.distance && <span> {otpUtils.distance.distanceString(leg.distance)} {notation}</span>}
            {` toward ${otpUtils.itinerary.getPlaceName(leg.to)}`}
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
              {otpUtils.itinerary.getStepDirection(step)}
              <span> on </span>
              <span style={{ fontWeight: 500 }}>
                {otpUtils.itinerary.getStepStreetName(step)}
              </span>
            </div>
          </div>
        })}
      </div>
    )
  }
}
