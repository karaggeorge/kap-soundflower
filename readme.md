# kap-soundflower [![Build Status](https://travis-ci.org/karaggeorge/kap-soundflower.svg?branch=master)](https://travis-ci.org/karaggeorge/kap-soundflower)

> [Kap](https://github.com/wulkano/kap) plugin - Record the system audio using Soundflower

## Install
1. Download [lastest soundflower release](https://github.com/mattingalls/Soundflower/releases).
2. In the `Kap` menu, go to `Preferences…`, select the `Plugins` pane, find this plugin, and toggle it.

## Usage

In the cropper or by right-clicking the tray icon, click the `…` icon, then `Plugins` and make sure `Record System Audio` is enabled.

## How it works

This plugin utilizes Soundflower virtual devices. It directs the system audio to the Soundflower output and then uses the linked Soundflower input to record the audio. If the user also wants to hear the system audio while recording, the plugin creates a “Multi-Output Device” from the Soundflower output and the system's default output device. Additionally, if the user wants to record from a different input device in addition to system audio, the plugin will create an aggregate device from the Soundflower input device and the selected input device. After the recording is over, the plugin will restore everything to the original state, removing any aggregate devices it created in the process.

Some other options include recording system audio effects, using the Soundflower 64 channel device, and setting the volume of the audio.

## Limitations

While recording, there's no way to adjust the system volume. Currently, there's no workaround for this, so the plugin offers a setting to adjust the volume before the recording starts.
