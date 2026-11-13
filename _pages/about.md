---
permalink: /
title: "About me"
author_profile: true
redirect_from: 
  - /about/
  - /about.html
---

Hi! I'm Anna, a third-year Ph.D. candidate in Electrical Engineering at Stanford, advised by [Caroline Trippel](https://cs.stanford.edu/people/trippel/) in the Stanford High Assurance Computer Architectures Lab. I'm supported by a Stanford Graduate Fellowship (Alma M. Collins Fellow).

I build formal models of the contracts between hardware and software. A contract says what software is allowed to rely on: which executions a processor may exhibit (ordering properties, as in memory consistency models) and what those executions may reveal (security properties such as leakage). Once a contract is written down formally, a solver can enumerate the small test programs, called litmus tests, that tell you whether a design keeps its promises. I use these models to automatically generate tests, and eventually proofs, that find bugs in real processor designs.

## Research

**SimSpect: security validation for hardware Spectre defenses.** Hardware defenses against Spectre come with security guarantees that are usually stated in prose. SimSpect formalizes a defense's guarantee as a leakage predicate, uses the Alloy model finder to synthesize minimal security litmus tests that would violate it, and steers those tests on the defense's gem5 prototype to check whether the violation actually happens. So far it has found six previously unknown bugs in published defense prototypes.

**Litmus tests for Arm's system-level memory model (ongoing).** Formal-model-driven litmus test synthesis, pioneered by Lustig et al., covers ordinary loads, stores, and fences. Real Arm processors follow a much richer ordering contract that also covers virtual memory and TLBs, pick dependencies, the Memory Tagging Extension (MTE), and exceptions. I'm extending synthesis to this system-level contract so that we can generate minimal test suites straight from the specification and use them to test state-of-the-art Arm cores.

**Memory Fit** (rotation with [Philip Levis](https://csl.stanford.edu/~pal/)). In systems with several kinds of memory, such as compressed swap (zswap) or CXL-attached memory, the OS has to decide where each page should live. Memory Fit is a hardware-accelerated metric that tells the OS how well each page fits each type of memory, computed by "soft trace matching" against learned models of good access traces. We implemented it on a BOOMv3 RISC-V core running Linux.

**Website fingerprinting through shared hardware** (undergraduate thesis, Princeton). In "Off-path Website Fingerprinting Through Shared Hardware Bottlenecks," I showed that an attacker who saturates a queue shared with a victim can tell which websites the victim is visiting just by watching the attacker's own traffic. Every packet arrives correctly, and the system still leaks. The thesis received the Charles Ira Young Medal for the best senior thesis research in Princeton ECE. That pattern, a system that works correctly and still leaks because its contract says nothing about it, is what got me into this area.

## Before Stanford

I graduated summa cum laude from Princeton in 2024 with a B.S.E. in Electrical and Computer Engineering and a certificate in Optimization and Quantitative Decision Science. Along the way I worked on neuromorphic photonic chips in Princeton's [Lightwave Lab](https://prucnal.princeton.edu/), used statistical-mechanics models to study U.S. Supreme Court dynamics at the [Complexity Science Hub](https://csh.ac.at/) in Vienna, interned as a software engineer on BlackRock's Aladdin Trading team, and was head of engineering at [Representable.org](https://representable.org/), a mapping tool that community groups and state governments used to document communities of interest during the 2021 redistricting cycle.

## News

- **Fall 2026:** Two papers currently under submission.
- **Oct 2026:** Talk and poster at the [Stanford Centaur](https://centaur.stanford.edu/) annual meeting, again.
- **Summer 2026:** Interned on Apple's CPU design-verification team in Austin, TX.
- **Jun 2026:** Talk and poster at the ISCA Young Architects Workshop (YArch).
- **Oct 2025:** Talk and poster on SimSpect at the FMCAD Student Forum.
- **Sep 2025:** Lightning talk and poster on SimSpect at the Stanford Centaur annual meeting.
- **Sep 2024:** Started my Ph.D. at Stanford.
- **May 2024:** Graduated from Princeton. My senior thesis received the Charles Ira Young Medal.

More on my [talks page](/talks/) and in my [CV](/files/cv.pdf).

## Outside research

I sing with the Stanford Chamber Chorale, sail J-70s in the Sequoia Yacht Club league, and train Brazilian jiu-jitsu. There's more about that, plus a puzzle and a Game of Life you can play with, on my [fun page](/fun/).
