# Change Log
For "Chrome DevTools extension to emulate WebVR API"
(Added, Changed, Deprecated, Removed, Fixed, Security)
https://github.com/spite/WebVR-Extension

## [Unreleased]
### Added
- Options for persistence on reload by @spite
- Options for sharing pose across tabs by @spite
- Store and restore poses by @spite

### Changed
- Switched message passing to CustomEvent dispatching by @spite
- Revamped UI and styles by @spite

### Fixed
- Emulated HMDs had externalDisplay disabled by @spite
- Ctrl key release by @spite

## [1.0.5] - 2016-08-30
### Added
- cancelAnimationFrame by @johnmaf

### Fixed
- Populate VRDisplay's righteye offset from model's right eye offset by @johnmaf
- Return value for requestAnimationFrame by @johnmaf

## [1.0.4] - 2016-08-30
### Fixed
- Fixed default quaternions by @spite

## [1.0.3] - 2016-07-12
### Added
- Emit event vrdisplaypresentchange by @spite
- VRDisplay.exitPresent by @spite

### Changed
- Removed Float32Array allocation in VRDisplay.getPose by @spite
- Profiles for Vive, Rift and Cardboard by @spite

### Greetings
- @edankwan for helping debug issue

## [1.0.2] - 2016-07-08
### Added
- Support for iframes by @spite
- Initial Polyfill for legacy API by @spite

## [1.0.1] - 2016-07-1
### Fixed
- Drawing order by @mrdoob.

### Changed
- Camera position by @mrdoob.
- Default StageParameters dimensions by @spite
- Changes to TransformControls by @mrdoob.

### Added
- Change log

## [1.0.0] - 2016-06-30
### Added
- Everything. First release to the Chrome Store
