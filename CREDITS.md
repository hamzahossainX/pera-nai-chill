# Credits & Licensing — Pera Nai Chill (Dhaka Rage Runner)

"Pera Nai Chill" is an open satirical 2D comic arcade game built with web technologies.

## Fonts
- **Luckiest Guy**: Designed by Brian J. Bonislawsky (Astigmatic). Licensed under the SIL Open Font License, Version 1.1.
- **Hind Siliguri**: Designed by Indian Type Foundry. Licensed under the SIL Open Font License, Version 1.1.

## Audio & Sound Design
- **Procedural WebAudio Synthesizer**: Handcrafted dynamic audio synthesis utilizing Web Audio API oscillators, biquad bandpass/lowpass/highpass filters, white noise buffers, and exponential decay gain ramps:
  - Slap & Punch: White noise burst + low resonant frequency thumps
  - Whoosh: Filtered frequency swept noise
  - Taka Coin: Dual-sine chime arpeggio
  - Powercut: Descending sinusoidal brownout sweep
  - Strike Siren: Dual alternating square-wave alarm
  - Fanfare & Lose Tunes: Procedural major pentatonic & minor chromatic synth chords
- Sound effects inspirited by CC0 public domain game audio archives (Kenney.nl, OpenGameArt, Freesound).

## Visuals & Art Style
- **Procedural Vector Engine**:
  - Sky gradients, neon skyline, parallax buildings, street electric cables, and Bengali asphalt road generated procedurally via HTML5 Canvas and Phaser Graphics texture generation.
  - Rickshaw-art style palette: saturated yellow (`#f59e0b`), truck-art crimson (`#e11d48`), emerald green (`#10b981`), and comic high-contrast ink outlines (`#000000`).
- **MediaPipe Tasks Vision**:
  - Real-time on-device face detector and landmark pipeline powered by Google MediaPipe FaceDetector (BlazeFace Short Range float16) running client-side via WebAssembly & WebGL.

## Responsible Use & Privacy
- **100% Client-Side Privacy**: All face detection, cropping, and cartoonification processing executes locally inside the browser memory. Zero images or personally identifiable data are ever transmitted to any remote server or stored in the cloud.
