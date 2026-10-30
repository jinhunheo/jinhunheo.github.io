---
title: Reaction wheel platform with vision tracking
register: Reaction wheel platform
category: research
order: 2
org: Freshman Research Initiative, Space & Robotics Stream
role: Student researcher
dates: Jan – May 2026
tools: [PID control, OpenCV, Flask, H-bridge + PWM]
description: "A reaction wheel platform: PID control that stops a hand spin in 0.5 s, OpenCV target tracking under shaking, and a lighter motor housing."
summary: >-
  A platform that turns itself with a reaction wheel. I tuned its control loops to stop
  a hand spin within 0.5 s and to keep tracking a coloured target while the target is
  shaken, and redesigned its motor housing.
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
figures: []
---

## How it works

A reaction wheel is a flywheel driven by a motor. Speed the wheel up one way and the
platform it is mounted on turns the other way. The same principle is used to point
satellites. This project ran in the Space & Robotics stream of UT Austin's Freshman
Research Initiative.

## Control and tracking

- A closed-loop PID controller brings a hand-spun platform to a stop within 0.5 s.
- A dual-loop PID architecture takes target positions from real-time OpenCV tracking,
  and kept 89% continuous tracking on coloured targets under violent shaking.
- A Flask web interface streams the live camera feed with a crosshair and bounding-box
  overlay, so tracking can be checked by eye while it runs.

## Hardware and power

- A weight-optimised motor housing cut battery consumption by 11% and tipping by 29%.
- An H-bridge gives bidirectional motor control with PWM duty-cycle modulation.
- Wire gauges sized from calculated peak current loads, to limit heating and keep the
  power system efficient.
