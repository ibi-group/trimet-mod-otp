// import necessary React/Redux libraries
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import {DateTimeSelector, setDepart, setDate, setTime} from 'otp-react-redux'
import { Button, Tab, Tabs } from 'react-bootstrap'

class DateTimeModal extends Component {
  static propTypes = {
    setDepart: PropTypes.func
  }

  state = {
    active: 'ITIN'
  }

  _onChange = (active) => this.setState({active})

  render () {
    const {active} = this.state
    return (
      <div className='date-time-modal'>
        <Tabs
          activeKey={active}
          bsStyle='pills'
          id='date-time-tabs'
          onSelect={this._onChange}
          className='date-time-tabs'>
          <Tab
            eventKey='ITIN'
            title='itinerary'
            tabClassName='half-width-tab'
            >
            <div style={{marginTop: '10px'}} >
            <DateTimeSelector />
            </div>
          </Tab>
          <Tab
            eventKey='PROFILE'
            title='profile'
            tabClassName='half-width-tab'
            >
            <div style={{marginTop: '10px'}} >
            profile selections
            </div>
          </Tab>
        </Tabs>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const {departArrive, date, time} = state.otp.currentQuery
  return {
    config: state.otp.config,
    departArrive,
    date,
    time
  }
}


const mapDispatchToProps = {
  setDepart,
  setDate,
  setTime

  // setDepart: (departArrive) => { dispatch(setDepart({ departArrive })) },
  // setDate: (date) => { dispatch(setDate({ date })) },
  // setTime: (time) => { dispatch(setTime({ time })) }
}

export default connect(mapStateToProps, mapDispatchToProps)(DateTimeModal)
