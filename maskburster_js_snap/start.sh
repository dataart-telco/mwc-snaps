#!/bin/bash
# One time handler to create config file.
if [ ! -f $SNAP_USER_DATA/config.js ]
then
  if [[ -f $SNAP/config.js.override && -r $SNAP/config.js.override ]]
  then
    echo "Copying config from SNAP dir"
    cp $SNAP/config.js.override $SNAP_USER_DATA/config.js
  elif [[ -f $SNAP/js_src/js/config.js.template && -r $SNAP/js_src/js/config.js.template ]]
  then
    echo "Copying config from template. You MUST fill it in with valid parameters"
    cp $SNAP/js_src/js/config.js.template $SNAP_USER_DATA/config.js
  else
    echo "Cannot create config file in $SNAP_USER_DATA"
    exit 1
  fi
fi

export LD_LIBRARY_PATH=$SNAP/usr/lib/x86_64-linux-gnu/dri:$LD_LIBRARY_PATH
$SNAP/bin/maskburster $SNAP/lib/node_modules/maskburster/

