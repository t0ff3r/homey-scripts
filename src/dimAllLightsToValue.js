const brightness = args[0];

if (!brightness) return;

const devices = await Homey.devices.getDevices();
const lights = _.filter(devices, device =>
    device.class === 'light' && _.indexOf(device.capabilities, 'dim') > -1);


const dimLightTo = async (light) => {
    const isLightOn = light.capabilitiesObj.onoff.value;
    const currentDim = light.capabilitiesObj.dim.value;

    if (!isLightOn) return;
    if (currentDim === brightness) return;

    await Homey.devices.setCapabilityValue({
        deviceId: light.id,
        capabilityId: 'dim',
        value: brightness,
    });
}

async function processLights(lights) {
  for (const light of lights) {
    await dimLightTo(light);
  }
}

await processLights(lights);

return lights;
