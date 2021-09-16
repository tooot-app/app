## Major releases - App Store

"Major releases" are artifacts published as `x.?.?`:
  * An artifact must be released as `x.?.?` if native modules have been changed or updated, including upgrading Expo SDK version.
  * A new app store version has to be submitted.
  * Outdated versions in principle do not receive further OTA updates.

## Minor releases - App Store

"Minor releases" are artifacts published as `?.y.?`:
  * An artifact can be released as `?.y.?` when there is no change nor update made to the native modules.
  * A new app store version can be submitted for better first launch experience.
  * All these versions that are not part of above mentioned outdates versions receive also OTA updates.

## Patch releases - OTA

"Patch releases" are artifacts published as `?.?.z`:
  * An artifact must be release as `?.?.z` when there is no major change to the functionalities.
  * No new app store version will be submitted.
  * All these versions that are not part of above mentioned outdates versions receive also OTA updates.

## OTA release channels

  * `MAJOR.MINOR-environment`. Environments include `release`, `candidate` and `development`.

## Major versions mapping to native module versions

| Version | Native module version | Expo version |
| :------:| :-------------------: | :----------: |
| `0-`    | `210201`              | `40.0.0`     |
| `1-`    | `210317`              | `40.0.0`     |
| `2.2`   | `210916`              | `41.0.0`     |