async function wait(timeout) {
  return new Promise(resolve => {
    _.delay(function(text) {
      resolve();
    }, timeout);
  });
}

const killLight = async light => {
  const isLightOn = light.capabilitiesObj.onoff.value;

  if (!isLightOn) return;

  await Homey.devices.setCapabilityValue({
    deviceId: light.id,
    capabilityId: 'onoff',
    value: false,
  });
};

async function processLights(lights) {
  for (const light of lights) {
    await killLight(light);
    await wait(500);
  }
}

void (async function() {
  try {
    const rooms = args[0];
    //const rooms = 'Yttergang,Toalett,Stue,Kjøkken';

    if (!rooms) return;

    const splitRooms = _.split(rooms, ',');
    const ordered = _.map(splitRooms, zone => _.trim(zone.toLowerCase()));
    const allZones = await Homey.zones.getZones();
    const zones = _.filter(
      allZones,
      zone => _.indexOf(ordered, zone.name.toLowerCase()) > -1,
    );

    let lights = [];
    for (const zone of zones) {
      const devices = await Homey.devices.getDevices();
      lights = _.concat(
        lights,
        _.filter(devices, device => {
          return device.class === 'light' && device.zone === zone.id;
        }),
      );
    }

    await processLights(lights);
  } catch (err) {
    console.error(err);
  }
})();
