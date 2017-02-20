## Maskburster JS client app
Used for ski-mask detection and alerts generation.
Utilizes [Tesnsorflow  API](https://github.com/dataart-telco/mwc-snaps/tree/master/tensorflow-api-snap) for image classifying.
.
### Build
Get the sources:
```
 git clone https://github.com/dataart-telco/mwc-snaps.git
 ```
Build the snap:
```
 cd maskburster_js_snap
 snapcraft
```
### Install
To install snap:
```
 sudo snap install --dangerous --devmode maskburster_0.1_amd64.snap
```
### Run
To launch app just type in command prompt:
```
maskburster
```
or in UI Open Unity Dash and search for `Maskburster` app.
### Troubleshooting
- Validate that maskburster snap installed:
```
$ snap list
Name            Version  Rev   Developer  Notes
maskburster     0.1      x1               devmode
```
- Connect and print application snap environment:
```
subo snap run --shell maskburster
env | grep SNAP
exit
```
- Validate application config and log files: 
```
subo snap run --shell maskburster
cat ${SNAP_USER_DATA}/config.js
less ${SNAP_USER_DATA}/app.log
```
