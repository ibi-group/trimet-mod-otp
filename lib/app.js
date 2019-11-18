import moment from 'moment'
import {
  DefaultMainPanel,
  LineItinerary,
  Map,
  MobileMain,
  ResponsiveWebapp,
  AppMenu
} from 'otp-react-redux'
import Icon from 'otp-react-redux/build/components/narrative/icon'
import LocationIcon from 'otp-react-redux/build/components/icons/location-icon'
// import React/Redux libraries
import React, { Component } from 'react'
// import Bootstrap Grid components for layout
import {
  Badge,
  Button,
  ButtonToolbar,
  Checkbox,
  Col,
  ControlLabel,
  DropdownButton,
  Form,
  FormControl,
  FormGroup,
  Grid,
  ListGroup,
  ListGroupItem,
  MenuItem,
  Modal,
  Nav,
  Navbar,
  Row,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
  Well
} from 'react-bootstrap'
// import OTP-RR components

const otpConfig = require(OTP_CONFIG)
export default class TrimetWebapp extends Component {
  state = {}

  /**
   * Get branding ID from config file. Defaults to TriMet.
   */
  _getBranding = () => otpConfig.branding || 'trimet'

  _getCustomIcons = (branding) => {
    let icons
    switch (branding) {
      case 'trimet':
        icons = require('./icons/trimet')
        break
      default:
        icons = require('./icons')
        break
    }
    // This is a bit of a hack that I believe may be related to
    // https://stackoverflow.com/questions/43247696/javascript-require-vs-require-default
    if (icons.__esModule) return icons.default
    else return icons
  }

  /**
   * Get itinerary footer for specified branding ID.
   */
  _getItinFooter = branding => {
    switch (branding) {
      case 'trimet':
        return (
          <div className='disclaimer'>
            Before you go, check{' '}
            <a
              href='https://trimet.org/#/tracker/'
              target='_blank'>
              TransitTracker
            </a> for real-time arrival information and any Service Alerts that may
            affect your trip. You can also
            <a
              href='https://trimet.org/tools/transittracker-bytext.htm'
              target='_blank'>
              text your Stop ID to 27299
            </a> or call 503-238-RIDE (7433), option 1. Times and directions are for
            planning purposes only, and can be affected by traffic, road conditions,
            detours and other factors.
            <div className='link-row'>
              <a href='https://trimet.org/legal/index.htm' target='_blank'>
                Terms of Use
              </a> •{' '}
              <a href='https://trimet.org/legal/privacy.htm' target='_blank'>
                Privacy Policy
              </a>
            </div>
          </div>
        )
      default:
        return (
          <div className='disclaimer'>
            <div className='link-row'>
              <a href='#' target='_blank'>
                Terms of Use
              </a> •{' '}
              <a href='#' target='_blank'>
                Privacy Policy
              </a>
            </div>
          </div>
        )
    }
  }
  render () {
    const branding = this._getBranding()
    const customIcons = this._getCustomIcons(branding)
    const itineraryFooter = this._getItinFooter(branding)
    /** desktop view **/
    const desktopView = (
      <div className='otp'>
        <Navbar>
          <Navbar.Header>
            <Navbar.Brand>
              <div className='app-menu-container'>
                <AppMenu />
              </div>
              <div
                className={`icon-${branding}`}
                // This style is applied here because it is only intended for
                // desktop view.
                style={{ marginLeft: 50 }} />
            </Navbar.Brand>
          </Navbar.Header>
          <Nav pullRight>
            <DropdownButton
              style={{margin: 5}}
              title={<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="user" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="svg-inline--fa fa-user fa-w-14 fa-3x">
                <path fill="currentColor" d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z" class=""></path>
              </svg>}
            >
              <MenuItem onClick={() => this.setState({showLoggedInModal: true})}>
                Not logged in!
              </MenuItem>
              <MenuItem onClick={() => this.setState({showCreateAccountModal: true})}>
                <Icon type='plus' /> Create Account
              </MenuItem>
            </DropdownButton>
          </Nav>
        </Navbar>
        <Grid>
          <Row className='main-row'>
            <Col sm={6} md={4} className='sidebar'>
              <DefaultMainPanel
                customIcons={customIcons}
                itineraryClass={LineItinerary}
                itineraryFooter={itineraryFooter}
              />
            </Col>
            <Col sm={6} md={8} className='map-container'>
              <Map />
            </Col>
          </Row>
        </Grid>
        <Modal show={this.state.showCreateAccountModal}>
          <Modal.Header closeButton>
            <Modal.Title>Create Account</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              An account will allow you to save trip planning preferences and
              monitor saved trips so that you can receive notifications of any
              possible delays. See our <a href='#'>Privacy Policy</a> to learn
              about how we use and manage your personal data. 
            </p>
            <Button bsStyle='success'>Create Account</Button>
          </Modal.Body>
          <Modal.Footer>
            <Button>Cancel</Button>
          </Modal.Footer>
        </Modal>
        <Modal className='example otp' show={this.state.showLoggedInModal}>
          <Modal.Header closeButton>
            <Modal.Title>Hello, User!</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Tabs>
              <Tab eventKey={1} title='Account'>
                <table>
                  <tr>
                    <td><b>Email:</b></td>
                    <td>bob@example.com</td>
                  </tr>
                  <tr>
                    <td><b>Email verified?</b></td>
                    <td>Yes ✅</td>
                  </tr>
                </table>
                <hr></hr>
                <Button style={{margin: 10}}>Change Password</Button>
                <Button style={{margin: 10}} bsStyle='danger'>Delete Account</Button>
              </Tab>
              <Tab eventKey={2} title='Saved Places'>
                <ul style={{padding: 0}}>
                  <Place detail='click to add' icon='home' title='Home' />
                  <Place detail='click to add' icon='briefcase' title='Work' />
                </ul>
                <hr/>
                <h4>Other places</h4>
                <div>
                  No places created yet,{' '}
                  <Button bsStyle='success'>Create New Place</Button>
                </div>
                <hr/>
                <h4>Favorite stops</h4>
                <div>
                  No favorite stops
                </div>
              </Tab>
              <Tab eventKey={3} title='Saved Trips'>
                <ListGroup>
                  <Trip active name='Home to Work' notifications />
                  <Trip name='Work to Home' notifications />
                  <Trip name='Home to Airport' />
                  <Trip name='Airport to Home' />
                </ListGroup>
              </Tab>
            </Tabs>
          </Modal.Body>
        </Modal>
      </div>
    )

    /** mobile view **/
    const mobileView = (
      <MobileMain
        map={(<Map />)}
        icons={customIcons}
        itineraryClass={LineItinerary}
        itineraryFooter={itineraryFooter}
        title={(<div className={`icon-${branding}`} />)}
      />
    )

    /** the main webapp **/
    return (
      <ResponsiveWebapp
        customIcons={customIcons}
        desktopView={desktopView}
        mobileView={mobileView}
      />
    )
  }
}

function Place ({ detail, icon, title }) {
  return (
    <li className='place-item'>
      <Button
        bsStyle='link'
        title={title}
        className='place-button'
        style={{ textDecoration: 'none', color: '#333' }}
        >
        <span
          className='place-text'>
          <Icon type={icon} /> {title}
        </span>
        <span
          className='place-detail'>
          {detail}
        </span>
      </Button>
    </li>
  )
}

function Trip ({ active, name, notifications }) {
  return (
    <ListGroupItem href='#'>
      <h4>
        <Icon type='map-signs' />
        <span style={{marginLeft: 6}}>{name}</span>
        {notifications &&
          <span className='pull-right'>
            <Icon type='feed' />
          </span>
        }
      </h4>
      {active &&
        <div>
          <p>
            <LocationIcon style={{margin: 5}} type='from' />
            <b>From:</b> 456 Neighborhood Street
          </p>
          <p>
            <LocationIcon style={{margin: 5}} type='to' />
            <b>To:</b> 123 Main Street
          </p>
          <p>
            <b>Arriving By:</b> 9:00am
          </p>
          <p>
            <b>Modes:</b> Walk, Bus, Rail
          </p>
          <Well bsSize='small'>
            <Checkbox checked readOnly>
              Monitoring enabled
            </Checkbox>
            <div style={{margin: 10}}>
              <Checkbox checked readOnly>
                Send email
              </Checkbox>
              <Checkbox checked readOnly>
                Send text
              </Checkbox>
              <ControlLabel style={{marginTop: 10}}>Days of Week to Monitor</ControlLabel>
              <ButtonToolbar>
                <ToggleButtonGroup type="checkbox" defaultValue={['mo','tu','we','th','fr']}>
                  <ToggleButton value={'mo'}>Mon</ToggleButton>
                  <ToggleButton value={'tu'}>Tue</ToggleButton>
                  <ToggleButton value={'we'}>Wed</ToggleButton>
                  <ToggleButton value={'th'}>Thu</ToggleButton>
                  <ToggleButton value={'fr'}>Fri</ToggleButton>
                  <ToggleButton value={'sa'}>Sat</ToggleButton>
                  <ToggleButton value={'su'}>Sun</ToggleButton>
                </ToggleButtonGroup>
              </ButtonToolbar>
              <Form inline>
                <FormGroup controlId="formControlsSelect" style={{marginTop: 20}}>
                  <ControlLabel style={{marginRight: 10}}>Minutes prior to check</ControlLabel>
                  <FormControl componentClass="select" placeholder="30">
                    <option value="30">30 minutes</option>
                  </FormControl>
                </FormGroup>
              </Form>
              <Button style={{marginTop: 20}}>Holidays <Badge>7</Badge></Button>
            </div>
          </Well>
          <Button bsStyle='danger'>Delete</Button>
        </div>
      }
    </ListGroupItem>
  )
}
