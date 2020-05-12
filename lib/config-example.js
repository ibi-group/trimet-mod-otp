/**
 * To perform some custom operations, create a file like this one and specify it
 * during build/start to override this default version of the file:
 *    yarn start --env.JS_CONFIG=/path/to/config.js
 *
 * Caveats: This file cannot import the following:
 * - other files
 * - modules not installed in the node_modules of this project
 */

// All imports in this file must have been installed from the trimet-mod-otp
// project.
import React from 'react'

// Import the base icon set use/customize.
import { ClassicFerry, ClassicModeIcon, LegIcon } from '@opentripplanner/icons'

/**
 * This is a private helper function that can be used to determine the icon name
 * to use based on information contained in the leg. Note: the internals here
 * SHOULD BE REPLACED. TriMetLegIcon from otp-ui already handles this logic.
 */
function getIconNameForLeg (leg) {
  if (
    leg.routeLongName &&
    leg.routeLongName.startsWith('Portland Streetcar')
  ) {
    return 'example'
  } else if (leg.duration > 60 * 10) {
    // E.g., if leg duration is greater than 10 minutes, return clock?
    return 'example'
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
  /**
   * Private function to return rendered custom icon (if exists in customIcons set).
   */
  function getCustomIconForMode (mode, props) {
    const CustomIcon = customIcons[mode]
    if (CustomIcon) return React.cloneElement(CustomIcon, {...props})
  }
  // Build a ModeIcon component from a base ModeIcon component
  // and from the customIcons set (they can't be imported from config.js).
  // If there is an exact-matching icon in customIcons, use it.
  const MyModeIcon = ({ mode, ...props }) => {
    if (!mode) return null;
    const customIcon = getCustomIconForMode(mode, props)
    if (customIcon) return customIcon
    // Typically, you'd just want to default to ClassicModeIcon, but you have
    // the option to override every icon with Ferry if you so wish! Note: this
    // can be deleted for production code. It's just for demonstration purposes.
    const overrideWithFerry = false
    const MainModeIcon = overrideWithFerry ? ClassicFerry : ClassicModeIcon
    return <MainModeIcon mode={mode} {...props} />
  }

  // Build the LegIcon component, including custom icons for some legs if any.
  const MyLegIcon = ({ leg, ...props }) => {
    const legIconName = getIconNameForLeg(leg)
    // If a custom leg icon should be applied, attempt to retrieve it from the
    // custom icons.
    let InternalModeIcon = MyModeIcon
    if (legIconName) {
      // FIXME: This override is not working for some reason?
      const customIcon = getCustomIconForMode(legIconName, props)
      if (customIcon) return customIcon
    }
    return <LegIcon leg={leg} ModeIcon={InternalModeIcon} {...props} />
  }
  return {
    /**
     * This is a function that will return a React Element of the itinerary
     * footer. This function is ran once on application startup.
     */
    getItineraryFooter: () => (
      <div className='disclaimer'>
        Hope you have a great trip!
      </div>
    ),
    LegIcon: MyLegIcon,
    ModeIcon: MyModeIcon
  }
}
