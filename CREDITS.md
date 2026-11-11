# Credits & Licensing — Pera Nai Chill (Dhaka Rage Runner)

"Pera Nai Chill" is an open satirical 2D comic arcade game built with web technologies, created with family-friendly Tom & Jerry slapstick humor and authentic local Dhaka urban flavor.

## Fonts
- **Luckiest Guy**: Designed by Brian J. Bonislawsky (Astigmatic). Licensed under the SIL Open Font License, Version 1.1.
- **Hind Siliguri**: Designed by Indian Type Foundry. Licensed under the SIL Open Font License, Version 1.1.

## Audio & Sound Design
- **Procedural Web Audio Engine**: Handcrafted dynamic procedural audio synthesis utilizing Web Audio API oscillators, biquad bandpass/lowpass/highpass filters, white noise buffers, exponential gain decay ramps, and stereo panners:
  - **Dynamic BGM Sequencer**: Procedural 136 BPM slapstick walking bassline and comic upbeat organ chords.
  - **Situational Filters**: Biquad resonant lowpass underwater muffle during urban flood; transistor bandpass during blackout.
  - **Vehicle Spatial Audio**: Rickshaw mechanical double bell ("Tring-tring!"), 2-stroke CNG sputtering engine, Dhaka city bus pneumatic horn, and motorbike rev with stereo panning and Doppler pitch variation.
  - **Weapons & Combat**: Cartoon rubbery slide-whistle banana slip, metallic tin can clatter, referee/police pea-whistle trill, triumphant brass victory fanfare, leather chappal thwack, and sparkling royal gold chime.
  - **Ambient Textures**: Nocturnal Dhaka crickets, morning sparrow chirps, and continuous filtered monsoon rain.
  - **Archetype Grunts**: Comic voice squeals, roars, and chicken clucks.
- Sound effects inspirited by CC0 public domain game audio archives (Kenney.nl, OpenGameArt, Freesound).

## Visuals & Art Style
- **Layered Vector SVG Pipeline**:
  - Outfits, masks, props, and limbs for all 7 archetypes authored in SVG vector format and rasterized at 2x crisp resolution with procedural vector geometry fallbacks in `BootScene.ts`.
  - MRT-6 elevated metro track, commuter trains, tea stalls, hawker carts, street dogs, crows, and signboards.
  - Rickshaw-art style palette: saturated yellow (`#f59e0b`), truck-art crimson (`#e11d48`), emerald green (`#10b981`), and high-contrast comic ink outlines (`#000000`).

## Computer Vision & Privacy
- **MediaPipe Tasks Vision**:
  - Real-time on-device face detector powered by Google MediaPipe FaceDetector (BlazeFace Short Range float16) running client-side via WebAssembly & WebGL.
- **100% Client-Side Privacy**:
  - All face detection, circular caricature cropping, wanted poster generation, and local save files execute locally inside the user's browser.
  - Zero images or personally identifiable data are ever transmitted over the network.
