#!/bin/bash
# One time handler for copy config file.
if [ ! -f $SNAP_USER_DATA/application.properties ] ; then
  if [ -f $SNAP/application.properties ]
  then
    echo "Copying configuration file from SNAP."
    cp $SNAP/application.properties $SNAP_USER_DATA/application.properties
    sed -i "s#^\(log_file=\).*#\1${SNAP_USER_DATA}\/log4j.properties#" $SNAP_USER_DATA/application.properties
    cp $SNAP/log4j.properties $SNAP_USER_DATA/log4j.properties
    sed -i "s#^\(log4j\.appender\.file\.File=\).*#\1${SNAP_USER_DATA}\/camera.log#" $SNAP_USER_DATA/log4j.properties
  else
    echo "Copying configuration file from template."
     cp $SNAP/application.properties.template $SNAP_USER_DATA/application.properties
     sed -i 's/^\(tensorflow_app_server=\).*/\10.0.0.0:5000/' $SNAP_USER_DATA/application.properties
     sed -i 's/^\(tensorflow_app_api_key=\).*/\1123/' $SNAP_USER_DATA/application.properties
     sed -i 's/^\(image_path=\).*/\1\/tmp\/camera-app/' $SNAP_USER_DATA/application.properties
     sed -i "s#^\(log_file=\).*#\1${SNAP_USER_DATA}\/log4j.properties#" $SNAP_USER_DATA/application.properties
     cp $SNAP/log4j.properties $SNAP_USER_DATA/log4j.properties
     sed -i "s#^\(log4j\.appender\.file\.File=\).*#\1${SNAP_USER_DATA}\/camera.log#" $SNAP_USER_DATA/log4j.properties
  fi
fi

export LD_LIBRARY_PATH=$SNAP/usr/lib/x86_64-linux-gnu/dri:$SNAP/usr/lib/jvm/default-java/jre/lib/amd64:$LD_LIBRARY_PATH
cd $SNAP/jar
#java -Dlog4j.configuration=file:${SNAP_USER_DATA}/log4j.properties -jar $SNAP/jar/camera-app-1.0-SNAPSHOT.jar
#java -DSNAP_USER_DATA=${SNAP_USER_DATA} -Dlog4j.configuration=file:${SNAP_USER_DATA}/log4j.properties -jar $SNAP/jar/camera-app-1.0-SNAPSHOT.jar
java -jar $SNAP/jar/camera-app-1.0-SNAPSHOT.jar
