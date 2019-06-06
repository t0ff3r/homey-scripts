async function wait(timeout) {
  return new Promise(resolve => {
    _.delay(function(text) {
      resolve();
    }, timeout);
  });
}

const dimLight = async (light, brightness) => {
  const currentDim = light.capabilitiesObj.dim.value;
  const isLightOn = light.capabilitiesObj.onoff.value;

  if (currentDim !== brightness) {
    await Homey.devices.setCapabilityValue({
      deviceId: light.id,
      capabilityId: 'dim',
      value: brightness,
    });
  }

  if (!isLightOn && light.driverUri === 'homey:app:nl.philips.hue') {
    await Homey.devices.setCapabilityValue({
      deviceId: light.id,
      capabilityId: 'onoff',
      value: true,
    });
  }
};

async function processLights(lights, brightness) {
  for (const light of lights) {
    await dimLight(light, brightness);
    await wait(500);
  }
}

void (async function() {
  const arguments = args[0];
  //const arguments = "0.4,Yttergang,Toalett,Stue,Kjøkken";

  if (!arguments) return;

  const splitArgs = _.split(arguments, ',');
  const brightness = parseFloat(_.head(splitArgs));
  const splitRooms = _.tail(splitArgs);
  const ordered = _.map(splitRooms, zone => _.trim(zone.toLowerCase()));
  const allZones = await Homey.zones.getZones();
  const zones = _.filter(
    allZones,
    zone => _.indexOf(ordered, zone.name.toLowerCase()) > -1,
  );
  let lights = [];

  for (const zone of zones) {
    try {
      const devices = await Homey.devices.getDevices();
      lights = _.concat(
        lights,
        _.filter(devices, device => {
          return device.class === 'light' && device.zone === zone.id;
        }),
      );
    } catch (err) {
      console.error(err);
    }
  }

  await processLights(lights, brightness);
})();
