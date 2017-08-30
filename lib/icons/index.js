import React from 'react'

import BikeIcon from './bike-icon'
import BiketownIcon from './biketown-icon'
import BusIcon from './bus-icon'
import GondolaIcon from './gondola-icon'
import TramIcon from './tram-icon'
import WalkIcon from './walk-icon'

// define Portland-specific mode icons
export default {
  BICYCLE: <BikeIcon />,
  BICYCLE_RENT: <BiketownIcon />,
  BUS: <BusIcon />,
  GONDOLA: <GondolaIcon />,
  TRAM: <TramIcon />,
  WALK: <WalkIcon />
}
