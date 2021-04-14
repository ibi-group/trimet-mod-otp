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
  LegIcon,
  MainControls,
  MainPanel,
  MapWindows,
  MobileResultsScreen,
  MobileSearchScreen,
  ModeIcon,
  TermsOfService,
  TermsOfStorage
} = jsConfig

// Check that the required components are defined in the configuration.
if (
  !ItineraryBody ||
  !LegIcon ||
  !MainPanel ||
  !MobileResultsScreen ||
  !MobileSearchScreen ||
  !ModeIcon
) {
  throw new Error('ItineraryBody, LegIcon, MainPanel, MobileResultsScreen, MobileSearchScreen, and ModeIcon must be defined in config.js')
}

const components = {
  defaultMobileTitle,
  ItineraryBody,
  ItineraryFooter,
  LegIcon,
  MainControls,
  MainPanel,
  MapWindows,
  MobileResultsScreen,
  MobileSearchScreen,
  ModeIcon,
  TermsOfService,
  TermsOfStorage
}

const TrimetWebapp = () => <ResponsiveWebapp components={components} />

export default TrimetWebapp
