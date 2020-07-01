/**
 * To customize certain UI features, create a file like this one and specify it
 * during build/start to override this default version of the file:
 *    yarn start --env.JS_CONFIG=/path/to/config.js
 *
 * Caveats: This file cannot import the following:
 * - other files
 * - modules not installed in the node_modules of this project.
 */

// All imports in this file must have been installed from the trimet-mod-otp
// project.
import React from 'react'

// Import the base icon set and additional icons to use/customize.
import {
  Biketown,
  LegIcon,
  StandardBike,
  StandardModeIcon,
  StandardStreetcar,
  TriMet
} from '@opentripplanner/icons'

// If you need to build a custom ModeIcon component,
// below is an example using StandardModeIcon as base,
// with some TriMet-specific mode customizations. as base.
// (You will need to import your own icon files to use them.)
const TriMetModeIcon = ({ mode, ...props }) => {
  // Override icons for as few or as many OTP modes as needed.
  if (mode === 'TRANSIT') return <TriMet {...props} />
  if (mode === 'BICYCLE_RENT') return <Biketown {...props} />
  // etc.

  // For the remaining icons, just fall back to StandardModeIcon.
  return <StandardModeIcon mode={mode} {...props} />
}

// You can also customize icons for specific itinerary legs.
// Here, we build a LegIcon component with TriMet-specific logic.
const TriMetLegIcon = ({ leg, ...props }) => {
  if (leg.routeLongName && leg.routeLongName.startsWith('Portland Streetcar')) {
    return <StandardStreetcar {...props} />
  }
  if (leg.rentedBike) {
    if (leg.from.networks && leg.from.networks[0] === 'GBFS') {
      return <BiketownIcon {...props} />;
    }
    return <StandardBike {...props} />;
  }

  return <LegIcon leg={leg} ModeIcon={StandardModeIcon} {...props} />;
};


/**
 * @param  {Object} otpConfig The contents of the yml config file as json.
 * @return  This function must return an object with the following attributes:
 * - getItineraryFooter (React component(*), optional)
 * - LegIcon (React component(*), required, see above for how to make one)
 * - ModeIcon (React component(*), required, see above for how to make one)
 *
 *   (*) These attributes can also be a function returning a React element,
 *       e.g. () => <div>{content}</div>
 */
export function configure (otpConfig) {
  return {
    /**
     * This is a function that will return a React Element of the itinerary
     * footer. This function is ran once on application startup.
     */
    getItineraryFooter: () => (
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
    ),
    // See above for more customization approaches.
    LegIcon: TriMetLegIcon,
    ModeIcon: TriMetModeIcon
  }
}
