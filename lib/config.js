/**
 * To customize certain UI features, create a file like this one and specify it
 * during build/start to override this default version of the file:
 *    yarn start --env.JS_CONFIG=/path/to/config.js
 *
 * Caveats: This file cannot import the following:
 * - other files
 * - modules not installed in the node_modules of this project.
 */
import { TriMetLegIcon, TriMetModeIcon } from '@opentripplanner/icons'
import {
  DefaultMainPanel,
  LineItinerary,
  MobileResultsScreen,
  MobileSearchScreen
} from 'otp-react-redux'
import React from 'react'

const ItineraryBody = LineItinerary
const LegIcon = TriMetLegIcon
const ModeIcon = TriMetModeIcon
const getItineraryFooter = () => (
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

/**
 * @param  {Object} otpConfig The contents of the yml config file as json.
 * @return  This function must return an object with the following attributes:
 * - getItineraryFooter (React component(*), optional)
 * - getMainPanel (React component(*), required)
 * - LegIcon (React component(*), required, it is recommended to import an
 *    existing LegIcon component from @opentripplanner/icons, but it is possible
 *    to create a custom component if desired.)
 * - ModeIcon (React component(*), required, it is recommended to import an
 *    existing ModeIcon component from @opentripplanner/icons, but it is
 *    possible to create a custom component if desired.)
 *
 *   (*) These attributes can also be a function returning a React element,
 *       e.g. () => <div>{content}</div>
 */
export function configure (otpConfig) {
  return {
    ItineraryBody,
    /**
     * This is a function that will return a React Element of the itinerary
     * footer. This function is ran once on application startup.
     */
    ItineraryFooter: getItineraryFooter,
    LegIcon,
    MainPanel: DefaultMainPanel,
    ModeIcon,
    MobileResultsScreen,
    MobileSearchScreen
  }
}
