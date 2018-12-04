import React from 'react'
import isMobile from 'is-mobile'

import { NarrativeItinerary, SimpleRealtimeAnnotation, otpUtils } from 'otp-react-redux'

import ItinerarySummary from './itin-summary'
import ItineraryBody from './itin-body'

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
      active,
      companies,
      expanded,
      itinerary,
      showRealtimeAnnotation
    } = this.props

    if (!itinerary) {
      return <div>No Itinerary!</div>
    }

    return (
      <div className='line-itin'>
        <ItinerarySummary companies={companies} itinerary={itinerary} />
        {showRealtimeAnnotation && <SimpleRealtimeAnnotation />}
        {active || expanded ? <ItineraryBody {...this.props} itinerary={itinerary} /> : null}
      </div>
    )
  }
}
