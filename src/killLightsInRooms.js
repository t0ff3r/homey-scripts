const killLight = async light => {
  const res = await Homey.devices.setCapabilityValue({
    deviceId: light.id,
    capabilityId: 'onoff',
    value: false,
  });

}

const killZoneLights = async zone => {
  const devices = await Homey.devices.getDevices();
  const lights = _.filter(devices, device => {
    return device.class === 'light' && device.zone === zone.id;
  });

  lights.map(killLight)
};

if (args[0] === undefined) return false;

const splitArgs = _.split(args[0], ',');
const ordered = _.map(splitArgs, zone => _.trim(zone));

const zones = await Homey.zones.getZones();
const orderedZones = _.filter(zones, zone => _.indexOf(ordered, zone.name.toLowerCase()) > -1);

orderedZones.map(await killZoneLights);

return ordered;
