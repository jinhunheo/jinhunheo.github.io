---
title: Human re-identification
category: research
order: 3
org: Learning Agents Research Group, UT Austin
role: Student researcher
dates: Dec 2025 – May 2026
skills: [ROS 2, PyTorch, CUDA, CNN models, Face recognition, RViz]
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
cover: reid-card
links:
  - url: https://github.com/jinhunheo/reid
    label: View the code
    description: >-
      The project's code on GitHub: a live ROS 2 pipeline with YOLO person detection,
      DeepSORT tracking and re-identification models, plus an EMANet re-identification
      network with its tests.
figures:
  - image: reid-robot
    kind: photo
    alt: The Booster T1 humanoid robot standing on a wheeled stand in the lab, with a ZED stereo camera as its head.
    caption: The Booster T1 humanoid, with a ZED stereo camera in its head.
  - image: reid-robot-side
    kind: photo
    alt: Side view of the Booster T1 in the lab, next to desks with monitors and laptops.
    caption: The robot at the lab bench during testing.
  - image: reid-workstation
    kind: photo
    alt: A workstation beside the robot, with a monitor showing the robot's camera feed in RViz and two laptops showing code.
    caption: Development setup. The robot's camera feed in RViz, beside the laptops used to build the pipeline.
  - video: reid-crossing
    image: reid-crossing-poster
    kind: video
    alt: Video of two people with ID labels moving around and crossing in front of the robot's camera.
    caption: Two tracked people, ID 0 and ID 1, cross in front of the robot.
  - video: reid-enter-leave
    image: reid-enter-leave-poster
    kind: video
    alt: Video of people leaving and entering the robot's camera view, with bounding boxes and ID labels.
    caption: People leave and enter the camera's view while the system assigns IDs.
  - video: reid-walk-away
    image: reid-walk-away-poster
    kind: video
    alt: Video of a person walking away down the hall while a bounding box follows them.
    caption: A person walks away down the hall and stays tracked at a distance.
  - video: reid-leave-view
    image: reid-leave-view-poster
    kind: video
    alt: Video of a tracked person turning and walking out of the camera's view.
    caption: A tracked person turns and walks out of view.
  - image: reid-camera-view
    kind: photo
    alt: A monitor showing the robot's camera view in RViz, with two people at desks in the frame.
    caption: The robot's live camera view in RViz.
---

## Project overview

RoboCup@Home tests robots on everyday tasks around people. To do that, a robot has to
keep recognizing the same person as they move, step out of view and come back. Every
time the tracker swaps two people's IDs, whatever the robot is doing for that person
breaks.

## My role

- A real-time re-identification pipeline on the Booster T1, combining two CNN
  deep-learning models with a tracking algorithm on ROS 2.
- Logic that keeps IDs stable using spatial tracking and an ID lifespan. ID switches
  dropped by 80%.
- Face recognition added to each person's profile, so an ID can be recovered after a
  change in lighting or clothing.
- CUDA acceleration for the PyTorch models, for a stable 22 fps.
- A live monitoring interface that broadcasts bounding-box data, for validation and
  debugging.
