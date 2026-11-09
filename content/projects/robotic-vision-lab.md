---
title: Hardware for a Husky UGV
category: internship
order: 1
org: Robotic Vision Lab, UT Arlington
role: Undergraduate Research Assistant
dates: June – Aug 2026
skills: [Autodesk Fusion, FDM 3D printing, Snap-fit design, Aluminum extrusion framing]
description: "3D-printed mounts, clips, enclosures and cable parts that keep sensors on a Husky UGV through bumpy field runs, from summer research at UT Arlington."
summary: >-
  Summer research at UT Arlington's Robotic Vision Lab. I improved how the sensors and
  electronics attach to the Husky UGV, designing and manufacturing 3D-printed mounts,
  clips, enclosures and cable-protection parts that hold up to bumpy field data
  collection and cut assembly and disassembly time for transport.
cover: rvl-husky-card
# Each entry is one spot in the gallery. Entries with `slides:` are swiped through
# with arrows; a `caption` next to `slides` is shared by every slide.
figures:
  - image: rvl-husky-field
    kind: photo
    alt: The Husky ground robot parked in a dry field beside a car with its trunk open, with an aluminum sensor rail on top and an antenna on a tripod nearby.
    caption: The Husky set up for a field run.
  - image: rvl-husky-deck
    kind: photo
    alt: Top deck of the Husky in the lab with the camera boom arm removed, showing two angled black ducts, an aluminum extrusion frame with two small cameras, and a white antenna module on a post.
    caption: Husky top deck without the boom arm (the aluminum extrusion that holds the ZED cameras).
  - image: rvl-mount-and-clip
    kind: photo
    alt: A black 3D-printed L-shaped mount with strap slots and bolt holes, a small printed clip and a length of metal rail on a desk.
    caption: Printed sensor mount, and a snap-fit clip for the metal rail.
  - slides:
      - image: rvl-cad-sensor-mount
        kind: cad
        alt: CAD model of the L-shaped sensor mount, with strap slots at the top and bottom and two counterbored holes.
        caption: Sensor mount. Strap slots top and bottom replace most of the fasteners.
      - image: rvl-halowlink
        kind: photo
        alt: A hand holding a small dark gray HaLowLink unit with green tape, an antenna and cables, beside the aluminum extrusion mast on the Husky.
        caption: The HaLowLink communication hardware that goes on this mount.
  - slides:
      - image: rvl-cad-snap-clip
        kind: cad
        alt: CAD model of the snap-fit clip, showing the hooked profile that grips the rail.
        caption: Snap-fit clip. The hook holds through vibration and comes off by hand.
      - image: rvl-enclosure-front
        kind: photo
        alt: The printed microcontroller enclosure held in a hand, with a red board visible through its two windows and the snap-fit clip underneath.
        caption: The microcontroller enclosure on its snap-fit clip, which attaches it to the metal rail inside the Husky's wiring box.
  - slides:
      - image: rvl-cad-sensor-plate
        kind: cad
        alt: CAD model of a rectangular mount plate with two counterbored holes and two small mounting holes.
        caption: Mount for the IMU.
      - image: rvl-imu
        kind: photo
        alt: A hand holding a small black LORD MicroStrain 3DM-GX5-25 IMU with colored wires attached.
        caption: The IMU it holds, a MicroStrain 3DM-GX5-25.
  - slides:
      - image: rvl-cad-sensor-tray
        kind: cad
        alt: CAD model of a flat tray with raised side rails, a curved back edge and four countersunk holes.
        caption: Mount for the NovAtel SMART7 GNSS antenna's mounting plate.
      - image: rvl-smart7
        kind: photo
        alt: The underside of the NovAtel SMART7 GNSS antenna held in a hand, with its black mounting plate attached.
        caption: The SMART7 antenna from below, with its mounting plate attached.
      - image: rvl-smart7-install
        kind: cad
        alt: Line drawing of the SMART7 antenna being lowered and turned onto its mounting plate, with two locking tabs circled.
        caption: How the SMART7 locks onto its mounting plate (NovAtel's install diagram).
  - caption: >-
      Microcontroller enclosure. Snap-fit side walls clamp the board, and the windows
      keep the pin headers, USB port and status LEDs reachable without opening the case.
    slides:
      - image: rvl-cad-enclosure
        kind: cad
        alt: CAD model of the closed microcontroller enclosure, with two windows showing the board inside.
      - image: rvl-cad-enclosure-open
        kind: cad
        alt: CAD model of the enclosure with its cover off and the board model seated between two side walls.
      - image: rvl-enclosure-angle
        kind: photo
        alt: The printed enclosure seen from an angle, showing the board's pin headers and USB connector through the windows.
  - slides:
      - image: rvl-cad-cable-guide
        kind: cad
        alt: CAD model of a long base with a spoked ring at each end.
        caption: >-
          Riser for a double-width aluminum extrusion. It lifts the extrusion slightly off
          the ground during transport, and the rings let the ZED camera cables run under
          and around it without being crushed.
      - image: rvl-extrusion-double
        kind: cad
        alt: Product image of a double-width aluminum T-slot extrusion.
        caption: Double-width aluminum extrusion, for reference (product image).
      - image: rvl-cad-cable-clamp
        kind: cad
        alt: CAD model of a U-shaped bracket with a bolt tab on each end.
        caption: >-
          A different design for a single-width extrusion. It just lifts the extrusion off
          the ground so cables can run underneath.
      - image: rvl-extrusion-single
        kind: cad
        alt: Product image of a single-width aluminum T-slot extrusion.
        caption: Single-width aluminum extrusion, for reference (product image).
      - image: rvl-cad-cable-bridge
        kind: cad
        alt: CAD model of a low bridge-shaped bracket with two countersunk holes and raised end tabs.
        caption: A part to wrap cables around, keeping them neatly organized on the extrusion.
  - image: rvl-cad-fan-grill
    kind: cad
    alt: CAD model of an angled duct with a honeycomb grill over its opening and a four-hole mounting flange.
    caption: Fan grill. A honeycomb grill keeps debris out of the robot's internal wiring.
  - image: rvl-calibration-rig
    kind: photo
    alt: An aluminum extrusion frame clamped to a lab bench, holding three numbered camera mounts along a crossbar.
    caption: >-
      Indoor ZED camera test and calibration rig. It replicates the cameras' exact height
      and position on the Husky, so calibration carries over to field runs.
---

## Project overview

The lab's Husky UGV carries multiple sensors, electronics and GPS hardware into
agricultural fields, collecting data for research on automating farm tasks. Out there
it has to survive bumpy, high-vibration runs. That hardware sometimes has to come off
for transport to the field, and it comes off again for troubleshooting once it's there.
Every bracket held on by a handful of fasteners costs time, and anything loose on a
vibrating robot turns into downtime, which is hard on everyone working in a cotton
field under the summer sun.

## My role

My contribution was to design sturdy, reliable mounts that keep the sensors,
electronics and GPS hardware exactly where they were meant to sit through every bumpy
field session, while making any sensor quick and easy to take off for troubleshooting.
Less downtime meant less time out in the sun.

**Sensor mounts.** Mounts with sliding alignment rails and slots for Velcro straps, so
sensors, communication hardware and electronics like the HaLowLink and GPS go on with far
fewer fasteners.

**Snap-fit clips.** Custom clips that hold electronics on the Husky's metal rails
through high-vibration tasks, but detach by hand when something needs troubleshooting.

**Microcontroller enclosure.** Side-clamping snap-fits hold the board. The enclosure
covers the GPIO pin headers and PCB traces from above, and leaves openings so pins can
still be reconfigured and the status LEDs stay visible.

**Fan grills and cable management.** Grills that keep debris out of the UGV's internal
wiring, and cable-management parts that keep sensor cables, like the ZED stereo
camera's, organized along the aluminum extrusions and stop them from being crushed
during transport.

**Sensor test rig.** An indoor rig that replicates the ZED cameras' exact height and
position on the Husky, so they can be tested and calibrated in the lab without
assembling the full UGV.
