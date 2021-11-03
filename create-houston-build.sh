#!/bin/bash

pwd
cp -rf ~/git/otp-react-redux/lib/components/form/connect-location-field.js ./node_modules/otp-react-redux/lib/components/form/

cp -rf ~/git/otp-ui/packages/location-field ./node_modules/@opentripplanner/
cp -rf ~/git/otp-ui/packages/core-utils ./node_modules/@opentripplanner/
cp -rf ~/git/otp-ui/packages/icons ./node_modules/@opentripplanner/
cp -rf ~/git/otp-ui/packages/trip-form ./node_modules/@opentripplanner/
cp -rf ~/git/otp-ui/packages/itinerary-body ./node_modules/@opentripplanner/
cp -rf ~/git/otp-ui/packages/transit-vehicle-overlay ./node_modules/@opentripplanner/

cp -rf ~/git/otp-ui/packages/location-field ./node_modules/otp-react-redux/node_modules/@opentripplanner/
cp -rf ~/git/otp-ui/packages/core-utils ./node_modules/otp-react-redux/node_modules/@opentripplanner/
cp -rf ~/git/otp-ui/packages/trip-form ./node_modules/otp-react-redux/node_modules/@opentripplanner/
cp -rf ~/git/otp-ui/packages/itinerary-body ./node_modules/otp-react-redux/node_modules/@opentripplanner/
cp -rf ~/git/otp-ui/packages/transit-vehicle-overlay ./node_modules/otp-react-redux/node_modules/@opentripplanner/
cp -rf ~/git/otp-ui/packages/icons ./node_modules/otp-react-redux/node_modules/@opentripplanner/