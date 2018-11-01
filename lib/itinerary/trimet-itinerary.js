import React from 'react'
import isMobile from 'is-mobile'

import { NarrativeItinerary, otpUtils } from 'otp-react-redux'

import ItinerarySummary from './itin-summary'
import ItineraryBody from './itin-body'

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
        const modeStr = otpUtils.itinerary.getLegModeString(leg)
        if (transitModes.indexOf(modeStr) === -1) transitModes.push(modeStr)
      }
    })

    // check for access mode
    if (!otpUtils.itinerary.isTransit(itinerary.legs[0].mode)) {
      summary += otpUtils.itinerary.getLegModeString(itinerary.legs[0])
    }

    // append transit modes, if applicable
    if (transitModes.length > 0) {
      summary += ' to ' + transitModes.join(', ')
    }

    return summary
  }

  render () {
    const {
      companies,
      expanded,
      itinerary
    } = this.props

    if (!itinerary) {
      return <div>No Itinerary!</div>
    }

    return (
      <div
        className='mobile-narrative-container'
        // height ensures that container can be swiped up when collapsed, but
        // interferes with div height when expanded
        style={!expanded ? { height: '1000px' } : null}
      >
        <div
          className='mobile-narrative-header'
          onClick={this.props.onClick}
        >
          Option {this.props.index + 1}
          <i
            className={`fa fa-caret-${expanded ? 'down' : 'up'}`}
            style={{ marginLeft: 8 }} />
        </div>
        <div className='line-itin'>
          <ItinerarySummary companies={companies} itinerary={itinerary} />
          <ItineraryBody {...this.props} itinerary={itinerary} />
        </div>
      </div>
    )
  }
}
