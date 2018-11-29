import React, { Component } from 'react'
import PropTypes from 'prop-types'
import isEqual from 'lodash.isequal'

import { TripDetails, TripTools } from 'otp-react-redux'

import PlaceRow from './place-row'

export default class ItineraryBody extends Component {
  static propTypes = {
    companies: PropTypes.string,
    itinerary: PropTypes.object,
    routingType: PropTypes.string
  }

  constructor (props) {
    super(props)
    this.rowKey = 0
  }

  shouldComponentUpdate (nextProps, nextState) {
    return !isEqual(this.props.companies, nextProps.companies) ||
      !isEqual(this.props.itinerary, nextProps.itinerary)
  }

  render () {
    const { itinerary, setActiveLeg } = this.props

    const rows = []
    itinerary.legs.forEach((leg, i) => {
      // Create a row containing the start place and leg details
      rows.push(
        <PlaceRow key={i}
          place={leg.from}
          time={leg.startTime}
          leg={leg}
          legIndex={i}
          {...this.props}
        />
      )
      if (i === itinerary.legs.length - 1) {
        rows.push(<PlaceRow place={leg.to} time={leg.endTime} setActiveLeg={setActiveLeg} key={i + 1} />)
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
