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
      showRealtimeAnnotation,
      onClick,
      timeFormat
    } = this.props

    if (!itinerary) {
      return <div>No Itinerary!</div>
    }

    const timeOptions = {
      format: timeFormat,
      offset: otpUtils.itinerary.getTimeZoneOffset(itinerary)
    }

    return (
      <div className='line-itin'>
        <ItinerarySummary companies={companies} itinerary={itinerary} timeOptions={timeOptions} onClick={onClick} />
        {showRealtimeAnnotation && <SimpleRealtimeAnnotation />}
        {active || expanded ? <ItineraryBody {...this.props} itinerary={itinerary} timeOptions={timeOptions} /> : null}
        <div className='disclaimer'>
          Before you go, check <a href='https://trimet.org/#/tracker/' target='_blank'>TransitTracker</a> for real-time arrival information and any Service Alerts that may affect your trip. You can also <a href='https://trimet.org/tools/transittracker-bytext.htm' target='_blank'>text your Stop ID to 27299</a> or call 503-238-RIDE (7433), option 1. Times and directions are for planning purposes only, and can be affected by traffic, road conditions, detours and other factors.
          <div className='link-row'>
            <a href='https://trimet.org/legal/index.htm' target='_blank'>Terms of Use</a> • <a href='https://trimet.org/legal/privacy.htm' target='_blank'>Privacy Policy</a>
          </div>
        </div>
      </div>
    )
  }
}
