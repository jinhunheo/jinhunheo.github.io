---
title: Reaction wheel testbed
category: research
order: 2
org: Freshman Research Initiative, Space & Robotics Stream
role: Student researcher
dates: Jan – May 2026
skills: [Onshape, Raspberry Pi, PID control, OpenCV, Flask, H-bridge + PWM]
description: "A reaction wheel testbed that stabilizes a rotating platform, stopping a hand spin within 0.5 s, and autonomously tracks a colored target."
summary: >-
  A semester-long project where I designed, manufactured, wired and programmed a
  reaction wheel testbed that uses the conservation of angular momentum to stabilize a
  rotating platform and autonomously track a colored object. In the real world, the
  same idea is used to control the orientation of a spacecraft.
metrics:
  - value: "0.5"
    unit: s
    label: to stop a hand-spun platform
    featured: true
cover: rw-card
documents:
  - file: Reaction-Wheel-Final-Report.pdf
    label: Read the final report
    description: >-
      Our team's final report: the full mechanical design, wiring, control system and
      test results, including disturbance rejection and autonomous tracking.
figures:
  - image: rw-platform
    kind: photo
    alt: The reaction wheel testbed on a table, with a purple wheel ringed with bolts on top, a motor inside a white pillar support, a Raspberry Pi, battery and toggle switch on the platform, and a round white base.
    caption: Reaction wheel testbed. Bolts around the wheel's rim add inertia.
  - video: rw-disturbance
    image: rw-disturbance-poster
    kind: video
    alt: Video of the platform being pushed by hand and returning to rest.
    caption: Disturbance rejection. After a push by hand, the wheel brings the platform back to rest.
  - video: rw-tracking
    image: rw-tracking-poster
    kind: video
    alt: Video of the platform turning to follow a green target, with the camera view on a laptop.
    caption: Tracking a green target, with the live camera view on the laptop.
  - image: rw-motor-support-drawing
    kind: cad
    alt: Engineering drawing of the motor support, a hollow cylinder with four pillars, 5.138 in tall, with top and side views.
    caption: My motor support drawing. Four pillars instead of walls keep the wiring reachable.
  - image: rw-wiring
    kind: cad
    alt: Wiring schematic with battery, fuse, switch, Raspberry Pi, IMU, H-bridge and a motor with encoder.
    caption: Wiring. A fuse and main switch protect the system; the Pi reads the IMU over I2C and drives the H-bridge with PWM.
  - image: rw-tracking-view
    kind: cad
    alt: Camera view from the monitoring interface, with a green target inside a red circle and crosshair lines.
    caption: The monitoring interface's camera view, with the crosshair and target overlay.
---

## Project overview

A reaction wheel is a flywheel driven by a motor. When the motor spins the wheel one
way, the platform it is mounted on turns the other way, because angular momentum is
conserved. Satellites use the same principle to change their orientation. Our team of
four built a testbed around it in the Space & Robotics stream of UT Austin's Freshman
Research Initiative.

To show that the testbed can turn to exactly where we want it, and get there quickly,
we demonstrated that it accurately tracks an optical target and rejects outside
disturbances, coming to a stop within seconds.

## My role

My contribution covered every part of the engineering: the hardware, the wiring, and
the programming and control. Safety was a goal throughout, so that no circuit could
short and the 3D-printed parts connecting the systems wouldn't wear or break. I also
wanted the code and PID controller to run smoothly, without jerky motions or
overshoot.

**Hardware.** I designed the motor housing in Onshape with four pillars instead of
solid walls, so the wiring stays easy to reach for troubleshooting and reconfiguration.
The motor attaches at the top using its own screw holes, instead of relying on a
friction fit at the bottom, which would be less sturdy.

**Wiring and power.** I designed the overall system circuitry, with a fuse at the start
for safety and an H-bridge for bidirectional motor control using PWM. I also brought
the system together physically, soldering wires to the electronics and heat-shrinking
exposed wires for safety. Wire gauges are sized from calculated peak current loads, to
limit heating and keep the power system efficient.

**Control and tracking.** I tuned a PID control loop that brings a disturbed platform
(spun by hand, for example) to a stop within 0.5 s, and developed a dual-loop PID
architecture that continuously tracks an optical target. A Flask web monitoring
interface streams the live camera view with a crosshair overlay, so you can see how
well the system is tracking.
