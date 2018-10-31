import React, { Component } from 'react'
import PropTypes from 'prop-types'

import customIcons from '../icons/index'
import StreetcarIcon from '../icons/streetcar-icon'

import { otpUtils } from 'otp-react-redux'

// TODO: make this a prop
const defaultRouteColor = '#008'

export default class ItinerarySummary extends Component {
  static propTypes = {
    itinerary: PropTypes.object
  }

  render () {
    const { companies, itinerary } = this.props

    const {
      centsToString,
      maxTNCFare,
      minTNCFare,
      transitFare
    } = otpUtils.itinerary.calculateFares(itinerary)
    // TODO: support non-USD
    const minTotalFare = minTNCFare * 100 + transitFare
    const maxTotalFare = maxTNCFare * 100 + transitFare

    return (
      <div className='itin-summary'>
        <div className='details'>
          {/* Travel time */}
          <div className='header'>{otpUtils.time.formatDuration(itinerary.duration)}</div>

          {/* Number of transfers, if applicable */}
          {itinerary.transfers > 0 && (
            <div className='detail'>
              {itinerary.transfers} transfer{itinerary.transfers > 1 ? 's' : ''}
            </div>
          )}

          {/* Trip cost */}
          {minTotalFare > 0 && (
            <div className='detail'>
              {centsToString(minTotalFare)}
              {minTotalFare !== maxTotalFare && <span> - {centsToString(maxTotalFare)}</span>}
            </div>
          )}


        </div>
        <div className='routes'>
          {itinerary.legs.filter(leg => {
            return leg.transitLeg || (leg.mode === 'CAR' && leg.hailedCar)
          }).map((leg, k) => {
            const longName = getRouteLongName(leg)
            const {isTNC, legMode} = otpUtils.itinerary.getLegMode(companies, leg)
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

// Helper functions

function getRouteLongName (leg) {
  return leg.routes && leg.routes.length > 0
    ? leg.routes[0].longName
    : leg.routeLongName
}

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
