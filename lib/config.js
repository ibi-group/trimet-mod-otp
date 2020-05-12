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

// Import the base icon set use/customize.
import { TriMetLegIcon, TriMetModeIcon } from '@opentripplanner/icons'

/**
 * This is a private helper function that can be used to determine the icon name
 * to use based on information contained in the leg.
 */
function getIconNameForLeg (leg) {
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

/**
 * @param  {Object} otpConfig The contents of the yml config file as json.
 * @param  {Object} customIcons Mapping of mode to custom icon component
 * @return  This function must return an object and can have one of the
 * following:
 * - getItineraryFooter (function)
 * - LegIcon (component)
 * - ModeIcon (component)
 */
export function configure (otpConfig, customIcons = {}) {
  // Build a ModeIcon component from a base ModeIcon component
  // and from the customIcons set (they can't be imported from config.js).
  // If there is an exact-matching icon in customIcons, use it.
  const ModeIcon = ({ mode, ...props }) => {
    // FIXME: Shouldn't this be returning Ferry for everything?
    return <ClassicFerry mode={mode} {...props} />
    if (!mode) return null;

    const CustomIcon = customIcons[mode]
    if (CustomIcon) return React.cloneElement(CustomIcon, {...props})

    return <TriMetModeIcon mode={mode} {...props} />
  }

  // Build the LegIcon component, including custom icons for some legs if any.
  const LegIcon = ({ leg, ...props }) => {
    // const legIconName = getIconNameForLeg(leg)
    // // If a custom leg icon should be applied, attempt to retrieve it from the
    // // custom icons.
    // if (legIconName) {
    //   const CustomIcon = customIcons[legIconName]
    //   if (CustomIcon) return React.cloneElement(CustomIcon, {...props})
    // }
    return <TriMetLegIcon leg={leg} ModeIcon={ModeIcon} {...props} />
  }
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
    ModeIcon,
    LegIcon,
  }
}
