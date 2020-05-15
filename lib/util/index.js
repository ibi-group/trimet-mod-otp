import React from 'react'

export function loadCustomIcons (otpConfig) {
  const customIcons = {}
  if (otpConfig.customIcons) {
    // Create a lookup of custom icons as specified in the config file
    Object.keys(otpConfig.customIcons).forEach(mode => {
      // Get the name of the icon to use from customIcons config.
      const iconName = otpConfig.customIcons[mode]
      // FIXME this will cause webpack to load every single icon file in the icons
      //   directory. See https://webpack.js.org/guides/dependency-management/#require-with-expression
      //   Perhaps a better way to go would be to refactor out all of the icon
      //   images so that they are URLs to image files such that they don't increase
      //   the size of the js bundle.
      let Icon = require(`../icons/${iconName}`)
      // This is a bit of a hack that I believe may be related to
      // https://stackoverflow.com/questions/43247696/javascript-require-vs-require-default
      if (Icon.__esModule) Icon = Icon.default
      customIcons[mode] = <Icon />
    })
  }
  return customIcons
}
