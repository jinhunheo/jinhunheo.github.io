---
title: Reaction wheel platform with vision tracking
register: Reaction wheel platform
category: research
order: 2
org: Freshman Research Initiative, Space & Robotics Stream
role: Student researcher
dates: Jan – May 2026
tools: [Onshape, Raspberry Pi, PID control, OpenCV, Flask, H-bridge + PWM]
description: "A reaction wheel platform: PID control that stops a hand spin in 0.5 s, OpenCV target tracking under shaking, and a lighter motor support."
summary: >-
  A platform that turns itself with a reaction wheel. I tuned its control loops to stop
  a hand spin within 0.5 s and to keep tracking a coloured target while the target is
  shaken, and designed its motor support.
metrics:
  - value: "0.5"
    unit: s
    label: to stop a hand-spun platform
    featured: true
  - value: "89"
    unit: "%"
    label: continuous tracking of a shaking target
  - value: "11"
    unit: "%"
    label: lower battery consumption
  - value: "29"
    unit: "%"
    label: less tipping
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
    caption: The finished testbed. Bolts around the wheel's rim add inertia.
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

## How it works

A reaction wheel is a flywheel driven by a motor. Speed the wheel up one way and the
platform it is mounted on turns the other way; satellites use the same principle to
point themselves. Our team of four built a testbed that uses it to hold still against
pushes and to turn toward a green target its camera sees, in the Space & Robotics
stream of UT Austin's Freshman Research Initiative.

## Control and tracking

- A closed-loop PID controller brings a hand-spun platform to a stop within 0.5 s.
- A dual-loop PID architecture takes target positions from real-time OpenCV tracking,
  and kept 89% continuous tracking on coloured targets under violent shaking.
- A Flask web interface streams the live camera feed with a crosshair and bounding-box
  overlay, so tracking can be checked by eye while it runs.

## Hardware and power

- I designed the motor support in Onshape: a hollow cylinder with four pillars instead
  of walls, so wires stay easy to reach, bolted to the platform and bearing instead of
  relying on a friction fit. The weight-optimised design cut battery consumption by 11%
  and tipping by 29%.
- An H-bridge gives bidirectional motor control with PWM duty-cycle modulation.
- Wire gauges sized from calculated peak current loads, to limit heating and keep the
  power system efficient.
