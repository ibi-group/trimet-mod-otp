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

const requiredComponents = {
  ItineraryBody,
  LegIcon,
  MainPanel,
  MobileResultsScreen,
  MobileSearchScreen,
  ModeIcon
}
const missingComponents = Object.keys(requiredComponents)
  .filter(key => !requiredComponents[key])

// Check that the required components are defined in the configuration.
if (missingComponents.length > 0) {
  throw new Error(`The following required components are missing from config.js: ${missingComponents.join(', ')}`)
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
