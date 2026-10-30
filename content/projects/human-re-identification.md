---
title: Human re-identification on a humanoid robot
register: Human re-identification
category: research
order: 3
org: Learning Agents Research Group, UT Austin
role: Student researcher
dates: Dec 2025 – May 2026
tools: [ROS 2, PyTorch, CUDA, CNN models, Face recognition]
description: "Real-time human re-identification on a Booster T1 humanoid for RoboCup@Home: two CNN models on ROS 2, 80% fewer ID switches, 22 fps."
summary: >-
  A real-time system that lets a Booster T1 humanoid keep track of which person is
  which, built for the RoboCup@Home competition. It cut ID switches by 80% and runs at
  a stable 22 fps.
metrics:
  - value: "80"
    unit: "%"
    label: fewer ID switches
    featured: true
  - value: "22"
    unit: fps
    label: stable processing rate
figures: []
---

## The problem

RoboCup@Home tests robots on everyday tasks around people. To do that, a robot has to
keep recognising the same person as they move, step out of view and come back. Every
time the tracker swaps two people's IDs, whatever the robot is doing for that person
breaks.

## What I built

- A real-time re-identification pipeline on the Booster T1, combining two CNN
  deep-learning models with a tracking algorithm on ROS 2.
- Logic that keeps IDs stable using spatial tracking and an ID lifespan. ID switches
  dropped by 80%.
- Face recognition added to each person's profile, so an ID can be recovered after a
  change in lighting or clothing.
- CUDA acceleration for the PyTorch models, for a stable 22 fps.
- A live monitoring interface that broadcasts bounding-box data, for validation and
  debugging.
