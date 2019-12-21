import React from 'react'

/**
 * To perform some custom operations, create a file like this one and reference
 * it in the config.yml entry `jsConfigFile`.
 *
 * Caveats: This file cannot import the following:
 * - other files
 * - modules not installed in the node_modules of this project
 *
 * @param  {Object} otpConfig The contents of the yml config file as json.
 * @return  This function must return an object and can have one of the
 * following functions:
 * - applyCustomIconLogic
 * - getItineraryFooter
 */
export function configure(otpConfig) {
  return {
    /**
     * Modify the customIcons object as needed
     */
    applyCustomIconLogic: customIcons => {
      customIcons.customIconForLeg = (leg) => {
        if (
          leg.routeLongName &&
          leg.routeLongName.startsWith('Portland Streetcar')
        ) {
          return 'STREETCAR'
        } else if (leg.rentedBike) {
          return 'BIKETOWN'
        }
        return null
      }
    },
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
    )
  }
}
