---
title: Human re-identification
category: research
order: 3
org: Learning Agents Research Group, UT Austin
role: Student researcher
dates: Dec 2025 – May 2026
skills: [Python, Linux, ROS 2, PyTorch, CUDA, CNN models, Face recognition]
description: "A real-time computer vision pipeline that lets a humanoid robot detect, track and re-identify people, built for the RoboCup@Home competition."
summary: >-
  A real-time computer vision pipeline, powered by a two-stage CNN architecture, that
  enables a humanoid robot to detect, track and re-identify individuals across dynamic
  camera feeds. Built for the challenging environments of the RoboCup@Home competition,
  the system features a custom identity-persistence framework that combines facial
  feature recognition with spatial tracking.
cover: reid-card
links:
  - url: https://github.com/jinhunheo/reid
    label: View the code
    description: >-
      The project's code on GitHub: a live ROS 2 pipeline with YOLO person detection,
      DeepSORT tracking and re-identification models, plus an EMANet re-identification
      network with its tests.
# Each entry is one spot in the gallery. Entries with `slides:` are swiped through
# with arrows.
figures:
  - slides:
      - image: reid-robot
        kind: photo
        alt: The Booster T1 humanoid robot standing on a wheeled stand in the lab, with a ZED stereo camera as its head.
        caption: The Booster T1 humanoid, with a ZED stereo camera in its head.
      - image: reid-robot-side
        kind: photo
        alt: Side view of the Booster T1 in the lab, next to desks with monitors and laptops.
        caption: The Booster T1 humanoid, with a ZED stereo camera in its head.
      - image: reid-workstation
        kind: photo
        alt: A workstation beside the robot, with a monitor showing the robot's camera feed in RViz and two laptops showing code.
        caption: Development setup. The robot's camera feed in RViz, beside the laptops used to build the pipeline.
  - image: reid-camera-view
    kind: photo
    alt: A monitor showing the robot's camera view in RViz, with two people at desks in the frame.
    caption: The robot's live camera view in RViz.
  - video: reid-crossing
    image: reid-crossing-poster
    kind: video
    alt: Video of two people with ID labels moving around and crossing in front of the robot's camera.
    caption: ID maintained after multiple occlusions (crossing paths), with similar clothing on top.
  - video: reid-enter-leave
    image: reid-enter-leave-poster
    kind: video
    alt: Video of people leaving and entering the robot's camera view, with bounding boxes and ID labels.
    caption: ID maintained on the person on the left after switching clothes, thanks to face recognition.
  - video: reid-walk-away
    image: reid-walk-away-poster
    kind: video
    alt: Video of a person walking away down the hall while a bounding box follows them.
    caption: A person walks away down the hall and stays tracked at a distance.
  - video: reid-leave-view
    image: reid-leave-view-poster
    kind: video
    alt: Video of a tracked person turning and walking out of the camera's view.
    caption: ID maintained even when the face was covered or the back was turned.
---

## Project overview

RoboCup@Home tests robots on everyday human-robot interaction tasks, such as greeting
guests, seating them like a receptionist, remembering personal preferences and
delivering the right food orders. To succeed, a robot must keep tracking each person's
identity even when they step out of view, so it never mixes up guests or delivers an
order to the wrong person. Dynamic competition environments add to the challenge:
crowded spaces cause frequent occlusions as people walk behind one another, and guests
may wear similar clothing.

## My role

My contribution was to architect the robot's human re-identification perception stack
for the competition, keeping identity tracking stable through crowded rooms and visual
edge cases without overloading the onboard compute.

**Low-latency edge compute.** A two-stage CNN architecture (YOLO-Pose and OSNet),
chosen over heavier Vision Transformers (ViTs) and VLMs to keep parameter counts and
GFLOPs low while still capturing distinctive appearance features.

**Clothing similarity and lighting variation.** A facial encoding gallery paired with
the full-body tracker, which crops the upper bounding box to match faces. It recovers
original IDs even when guests wear identical shirt colors or walk under shifting room
lighting that changes how fabric colors register on camera.

**Random ID switching and occlusion.** Custom spatial IoU constraints and track-lifespan
seniority logic that anchor stationary targets to their previous bounding boxes and
prioritize established tracks over newly spawned IDs. This keeps the tracker from
swapping identities when people cross paths or briefly block the camera.
