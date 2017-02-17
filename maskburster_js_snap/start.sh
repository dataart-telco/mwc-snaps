#!/bin/bash
# One time handler to create config file.
if [ ! -f $SNAP_USER_DATA/config.js ]
then
  if [[ -f $SNAP/js_src/js/config.js && -r $SNAP/js_src/js/config.js ]]
  then
    echo "Copying config from SNAP dir"
    cp $SNAP/js_src/js/config.js $SNAP_USER_DATA/
  elif [[ -f $SNAP/config.js.template && -r $SNAP/config.js.template ]]
  then
    echo "Copying config from template."
    cp $SNAP/config.js.template $SNAP_USER_DATA/config.js
  else
    echo "Cannot create config file in $SNAP_USER_DATA"
    exit 1
  fi
fi

export LD_LIBRARY_PATH=$SNAP/usr/lib/x86_64-linux-gnu/dri:$LD_LIBRARY_PATH
$SNAP/bin/maskburster $SNAP/lib/node_modules/maskburster/

