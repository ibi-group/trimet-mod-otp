import React from 'react'

// import OTP-RR components
import {
  ResponsiveWebapp,
  otpUtils
} from 'otp-react-redux'

// Loads a yaml config file which is set in the webpack.config.js file. This
// setting is defined from a custom environment setting passed into webpack or
// defaults to ./config.yml
const otpConfig = require(YAML_CONFIG)

// Loads a JavaScript file which is set in the webpack.config.js file. This
// setting is defined from a custom environment setting passed into webpack or
// defaults to ./config.js
const jsConfig = require(JS_CONFIG).configure(otpConfig)

const {
  defaultMobileTitle = null,
  ItineraryBody,
  ItineraryFooter,
  getContainerSlot,
  getMapContainerSlot,
  LegIcon,
  MainPanel,
  MobileResultsScreen,
  MobileSearchScreen,
  ModeIcon,
  TermsOfService,
  TermsOfStorage
} = jsConfig

// Helper method to get component if the getMethod param is a valid function
const getComponentIfExists = (getMethod) => {
  return typeof getMethod === 'function'
    ? getMethod()
    : null
}

// Check that the required components are defined in the configuration.
if (
  !ItineraryBody ||
  !LegIcon ||
  !MainPanel ||
  !MobileResultsScreen ||
  !MobileSearchScreen ||
  !ModeIcon
) {
  throw new Error('ItineraryBody, getMainPanel, LegIcon, MobileResultsScreen, MobileSearchScreen, and ModeIcon must be defined in config.js')
}

const components = {
  defaultMobileTitle: null,
  ItineraryBody,
  ItineraryFooter,
  LegIcon,
  MainControls: getComponentIfExists(getContainerSlot),
  MainPanel,
  MapWindows: getComponentIfExists(getMapContainerSlot),
  MobileResultsScreen,
  MobileSearchScreen,
  ModeIcon,
  TermsOfService,
  TermsOfStorage
}

const TrimetWebapp = () => <ResponsiveWebapp components={components} />

export default TrimetWebapp
