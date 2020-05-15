/**
 * To perform some custom operations, create a file like this one and reference
 * it in the config.yml entry `jsConfigFile`.
 *
 * Caveats: This file cannot import the following:
 * - other files
 * - modules not installed in the node_modules of this project
 */

// All imports in this file must have been installed from the trimet-mod-otp
// project.
import React from 'react'

// Import the base icon set to use/customize.
import { ClassicModeIcon } from '@opentripplanner/icons'

/**
 * @param  {Object} otpConfig The contents of the yml config file as json.
 * @return  This function must return an object and can have one of the
 * following functions:
 * - applyCustomIconLogic
 * - getItineraryFooter
 */
export function configure(otpConfig) {
  return {
    /**
     * (Optional) Define the base icon set to use/customize.
     * Defaults to @opentripplanner/icons/ClassicModeIcon
     */
    baseModeIcon: ClassicModeIcon,
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
    /**
     * (Optional) If you need leg-specific customizations,
     * enter them below.
     * The example provided shuffles icon names around for illustration purposes.
     */
    getIconNameForLeg: leg => {
      const customStreetcarIconName = 'RAIL'
      const customRentalBikeIconName = 'GONDOLA'
      
      if (
        leg.routeLongName &&
        leg.routeLongName.startsWith('MAX')
      ) {
        return customStreetcarIconName
      } else if (leg.rentedBike) {
        return customRentalBikeIconName
      }

      return null
    }
  }
}
