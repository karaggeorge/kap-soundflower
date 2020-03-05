'use strict';
const {Notification, shell} = require('electron');
const {
  getAllDevices,
  getDefaultInputDevice,
  getDefaultOutputDevice,
  setDefaultInputDevice,
  setDefaultOutputDevice,
  createAggregateDevice,
  getDefaultSystemDevice,
  setDefaultSystemDevice,
  setOutputDeviceVolume,
  destroyAggregateDevice
} = require('macos-audio-devices');

const config = {
  volume: {
    title: 'Volume',
    description: 'Volume of the system audio while recording',
    type: 'number',
    minimum: 0,
    maximum: 1,
    default: 1,
    required: true
  },
  combineInputDevices: {
    title: 'Combine Input Devices',
    description: 'Use both system audio and the selected input device for audio recording',
    type: 'boolean',
    default: true
  },
  combineOutputDevices: {
    title: 'Combine Output Devices',
    description: 'Keep system audio playing through default output device while recording',
    type: 'boolean',
    default: true
  },
  includeSystemSounds: {
    title: 'Include System Sounds',
    description: 'Include system sound effects like notifications in the recording',
    type: 'boolean',
    default: false
  },
  use64Channel: {
    title: '64 Channel',
    description: 'Use the 64 Channel Soundflower device instead',
    type: 'boolean',
    default: false
  }
};

const willStartRecording = async ({state, apertureOptions, config}) => {
  const {use64Channel, volume, combineInputDevices, combineOutputDevices, includeSystemSounds} = config.store;
  const channel = use64Channel ? '64ch' : '2ch';

  state.defaultInputDevice = getDefaultInputDevice().id;
  state.defaultOutputDevice = getDefaultOutputDevice().id;

  const devices = getAllDevices();
  const soundflowerDevices = devices.filter(device => device.name.toLowerCase().includes('soundflower'));
  const soundflower = soundflowerDevices.find(device => device.name.toLowerCase().includes(channel)) || devices[0];

  let inputDevice = soundflower;
  let outputDevice = soundflower;

  if (includeSystemSounds) {
    state.defaultSystemDevice = getDefaultSystemDevice().id;
    setDefaultSystemDevice(soundflower.id);
  }

  if (apertureOptions.audioDeviceId && combineInputDevices) {
    try {
      const apertureDevice = devices.find(device => device.uid === apertureOptions.audioDeviceId);
      inputDevice = createAggregateDevice('Kap Input Device', apertureDevice.id, [soundflower.id]);
      state.inputAggregateDevice = inputDevice.id;
    } catch { }
  }

  if (combineOutputDevices) {
    try {
      outputDevice = createAggregateDevice('Kap Output Device', state.defaultOutputDevice, [soundflower.id], {multiOutput: true});
      state.outputAggregateDevice = outputDevice.id;
    } catch { }
  }

  console.log(state);

  try {
    setOutputDeviceVolume(soundflower.id, volume);
  } catch { }

  setDefaultOutputDevice(outputDevice.id);
  setDefaultInputDevice(inputDevice.id);

  apertureOptions.audioDeviceId = inputDevice.uid;
};

const didStopRecording = async ({state}) => {
  setDefaultInputDevice(state.defaultInputDevice);
  setDefaultOutputDevice(state.defaultOutputDevice);

  if (state.defaultSystemDevice) {
    setDefaultSystemDevice(state.defaultSystemDevice);
  }

  if (state.outputAggregateDevice) {
    destroyAggregateDevice(state.outputAggregateDevice);
  }

  if (state.inputAggregateDevice) {
    destroyAggregateDevice(state.inputAggregateDevice);
  }
};

const openSoundflowerInstructions = () => shell.openExternal('https://github.com/mattingalls/Soundflower/releases');

const checkSoundflower = () => {
  const devices = getAllDevices();

  if (devices.some(device => device.name.toLowerCase().includes('soundflower'))) {
    return true;
  }

  const notification = new Notification({
    title: 'kap-soundflower',
    body: 'Please install Soundflower to use this plugin. Click for instructions.'
  });

  notification.on('click', () => {
    openSoundflowerInstructions();
  });
  notification.show();

  return false;
};

const recordSystemAudio = {
  title: 'Record system audio',
  willStartRecording,
  didStopRecording,
  willEnable: checkSoundflower,
  config,
  configDescription: 'While recording, you will not be able to adjust the volume, so make sure to set it before initiating the recording.'
};

exports.didInstall = checkSoundflower;

exports.recordServices = [recordSystemAudio];
