---
title: Sensor mounts and enclosures for a field robot
register: Hardware for a Husky UGV
category: internship
order: 1
org: Robotic Vision Lab, UT Arlington
role: Undergraduate Research Assistant
dates: June – Aug 2026
tools: [CAD, FDM 3D printing, Snap-fit design]
description: "3D-printed sensor mounts, snap-fit clips, an enclosure and fan grills for a Husky ground robot at UT Arlington. Cut hardware assembly time by 67%."
summary: >-
  Summer research at UT Arlington's Robotic Vision Lab. I designed the 3D-printed
  mounts, clips, enclosure and guards that hold sensors and electronics on a Husky
  ground robot, and a bench rig for testing sensors off the robot.
metrics:
  - value: "67"
    unit: "%"
    label: less hardware assembly time
    featured: true
cover: rvl-husky-card
figures:
  - image: rvl-husky-field
    kind: photo
    alt: The Husky ground robot parked in a dry field beside an open car boot, with an aluminium sensor rail on top and an antenna on a tripod nearby.
    caption: The Husky set up for a field run.
  - image: rvl-husky-deck
    kind: photo
    alt: Top deck of the Husky in the lab, with two angled black ducts, two cameras on an aluminium extrusion frame and a white antenna module on a post.
    caption: Husky top deck. The two angled ducts carry the printed fan grills.
  - image: rvl-mount-and-clip
    kind: photo
    alt: A black 3D-printed L-shaped mount with strap slots and bolt holes, a small printed clip and a length of metal rail on a desk.
    caption: Printed sensor mount, and a snap-fit clip for the metal rail.
  - image: rvl-cad-sensor-mount
    kind: cad
    alt: CAD model of the L-shaped sensor mount, with strap slots at the top and bottom and two counterbored holes.
    caption: Sensor mount. Strap slots top and bottom replace most of the fasteners.
  - image: rvl-cad-snap-clip
    kind: cad
    alt: CAD model of the snap-fit clip, showing the hooked profile that grips the rail.
    caption: Snap-fit clip. The hook holds through vibration and comes off by hand.
  - image: rvl-cad-sensor-plate
    kind: cad
    alt: CAD model of a rectangular mount plate with two counterbored holes and two small mounting holes.
    caption: Mount for sensor electronics, such as the IMU and GPS.
  - image: rvl-cad-sensor-tray
    kind: cad
    alt: CAD model of a flat tray with raised side rails, a curved back edge and four countersunk holes.
    caption: Tray-style mount with side rails for sensor electronics.
  - image: rvl-cad-enclosure
    kind: cad
    alt: CAD model of the closed microcontroller enclosure, with two windows showing the board inside.
    caption: Microcontroller enclosure. The windows keep pin headers and status LEDs in view.
  - image: rvl-cad-enclosure-open
    kind: cad
    alt: CAD model of the enclosure with its cover off and the board model seated between two side walls.
    caption: Cover off. The side walls clamp the board with snap-fits.
  - image: rvl-enclosure-front
    kind: photo
    alt: The printed enclosure held in a hand, with a red microcontroller board visible through its two windows and a rail clip underneath.
    caption: The printed enclosure on its rail clip.
  - image: rvl-enclosure-angle
    kind: photo
    alt: Another angle of the printed enclosure, showing the board's pin headers and USB connector through the windows.
    caption: Pins and USB stay reachable without opening the case.
  - image: rvl-cad-cable-guide
    kind: cad
    alt: CAD model of a long bracket with a round cable ring at each end.
    caption: Cable guide. Rings at each end route sensor cables, like the ZED camera's, along the extrusion.
  - image: rvl-cad-cable-clamp
    kind: cad
    alt: CAD model of a U-shaped cable clamp with a bolt tab on each end.
    caption: Cable clamp that holds sensor cables against the aluminium extrusion.
  - image: rvl-cad-cable-bridge
    kind: cad
    alt: CAD model of a low bridge-shaped bracket with two countersunk holes and raised end tabs.
    caption: Cable bridge that bolts to the extrusion to keep sensor cables in place.
  - image: rvl-cad-fan-grill
    kind: cad
    alt: CAD model of an angled duct with a honeycomb grill over its opening and a four-hole mounting flange.
    caption: Fan grill. A honeycomb grill keeps debris out of the robot's internal wiring.
  - image: rvl-calibration-rig
    kind: photo
    alt: An aluminium extrusion frame clamped to a lab bench, holding three numbered camera mounts along a crossbar.
    caption: Indoor sensor test and calibration rig.
---

## The problem

The lab's Husky UGV carries stereo cameras, communication hardware and a
microcontroller. That hardware goes onto the robot, comes off for troubleshooting
and travels to field runs. Every bracket held on by a handful of fasteners costs
time, and anything loose on a vibrating robot turns into downtime.

## What I designed

**Sensor mounts.** Mounts with sliding alignment rails and slots for Velcro straps,
so sensors and communication hardware go on with far fewer fasteners, plus mounts for
sensor electronics like the IMU and GPS. Hardware assembly time dropped by 67%.

**Snap-fit clips.** Custom clips that hold electronics on the Husky's metal rails
through high-vibration tasks, but detach by hand when something needs troubleshooting.

**Microcontroller enclosure.** Side-clamping snap-fits hold the board. The enclosure
covers the GPIO pin headers and PCB traces from above, and leaves openings so pins can
still be reconfigured and the status LEDs stay visible.

**Fan grills and cable management.** Grills that keep debris out of the UGV's internal
wiring, and cable guides, clamps and bridges that route sensor cables, like the ZED
stereo camera's, neatly along the aluminium extrusions and protect them during transport.

**Sensor test rig.** An indoor rig for testing and calibrating sensors, so they can be
verified in the lab without assembling the full UGV.
