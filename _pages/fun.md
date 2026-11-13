---
permalink: /fun/
title: "Fun"
author_profile: true
extra_css:
  - /assets/css/fun.css
---

A few things I like that don't fit on a CV: a puzzle, a Game of Life to play with, some cryptic clues, and what I get up to away from my desk.

## A puzzle

<div class="monogram-puzzle">
<svg id="monogram" class="monogram" viewBox="0 0 8 8" role="img" aria-label="An 8 by 8 grid of black and white squares">
<rect class="monogram__paper" width="8" height="8"/>
<path class="monogram__ink" d="M4 0h1v1h-1zM6 0h1v1h-1zM0 1h3v1h-3zM4 1h1v1h-1zM6 1h2v1h-2zM0 2h1v1h-1zM3 2h5v1h-5zM0 3h1v1h-1zM3 3h3v1h-3zM1 4h1v1h-1zM3 4h1v1h-1zM5 4h1v1h-1zM1 5h2v1h-2zM5 5h2v1h-2zM5 6h1v1h-1zM7 6h1v1h-1zM1 7h3v1h-3zM6 7h2v1h-2z"/>
<path class="monogram__curve" d="M0.5 0.5L0.5 1.5L1.5 1.5L1.5 0.5L2.5 0.5L3.5 0.5L3.5 1.5L2.5 1.5L2.5 2.5L3.5 2.5L3.5 3.5L2.5 3.5L1.5 3.5L1.5 2.5L0.5 2.5L0.5 3.5L0.5 4.5L1.5 4.5L1.5 5.5L0.5 5.5L0.5 6.5L0.5 7.5L1.5 7.5L1.5 6.5L2.5 6.5L2.5 7.5L3.5 7.5L3.5 6.5L3.5 5.5L2.5 5.5L2.5 4.5L3.5 4.5L4.5 4.5L5.5 4.5L5.5 5.5L4.5 5.5L4.5 6.5L4.5 7.5L5.5 7.5L5.5 6.5L6.5 6.5L6.5 7.5L7.5 7.5L7.5 6.5L7.5 5.5L6.5 5.5L6.5 4.5L7.5 4.5L7.5 3.5L7.5 2.5L6.5 2.5L6.5 3.5L5.5 3.5L4.5 3.5L4.5 2.5L5.5 2.5L5.5 1.5L4.5 1.5L4.5 0.5L5.5 0.5L6.5 0.5L6.5 1.5L7.5 1.5L7.5 0.5"/>
<circle class="monogram__start" cx="0.5" cy="0.5" r="0.2"/>
</svg>
<p class="monogram__caption">1891</p>
<button type="button" class="btn btn--inverse btn--small" data-hilbert-hint aria-controls="monogram" aria-pressed="false">Hint</button>
<details class="spoiler">
<summary>Answer</summary>
<p>1891 is the year David Hilbert published his space-filling curve. Follow the curve from the top-left corner (first step down) to the top-right corner and read each square as a bit, black&nbsp;=&nbsp;1 and white&nbsp;=&nbsp;0. The 64 bits are eight bytes of ASCII:</p>
<p class="bits">01100001 01100011 01100010 01100101 01100001 01110100 01101111 01101110</p>
<p>That spells <strong>acbeaton</strong>, my email handle. And if you run the picture as a Game of Life pattern (pick &ldquo;Monogram&rdquo; below), it falls apart into exactly one glider and one block.</p>
</details>
</div>

## Game of Life

Conway's Game of Life is a grid of cells that are alive or dead. Each generation, a dead cell with exactly three live neighbors comes alive, and a live cell with two or three live neighbors survives; everything else dies. The board starts on *ANNA*: a swarm of gliders and small seeds that collide their way into my name and then hold still, 448 generations later. Pick another pattern, or click (or tap) cells to draw your own. The board is unbounded, so gliders that fly off the edge just keep going.

<div class="life" data-life data-anna-rle="{{ '/assets/life/anna.rle' | relative_url }}">
<noscript><p>The Game of Life board needs JavaScript.</p></noscript>
</div>

### About the background

The faint pattern behind every page of this site is the same Game of Life. It starts as 938 cells spread along four diagonal arms: gliders, plus small seeds that churn for a while before each one throws off a glider. The gliders meet in pairs, and every collision is timed to leave behind exactly one 2×2 block and nothing else. Fifty-four of those blocks, built from the middle outward, spell my name, and from generation 448 on nothing moves. The run keeps going as you click between pages, so you can watch it finish. If your device asks for reduced motion, it just shows the finished word.

## Cryptic clues

A few clues with a research flavor. Each one is a definition plus wordplay.

<ol class="clues">
<li><span class="clue">Broken respect for a speculative ghost (7)</span>
<details class="spoiler"><summary>Answer</summary><p><strong>SPECTRE</strong>: an anagram (&ldquo;broken&rdquo;) of RESPECT. Spectre attacks exploit speculative execution.</p></details></li>
<li><span class="clue">Reordered multisets with time: a decisive check (6,4)</span>
<details class="spoiler"><summary>Answer</summary><p><strong>LITMUS TEST</strong>: an anagram (&ldquo;reordered&rdquo;) of MULTISETS plus T for time. Litmus tests are also what most of my research produces.</p></details></li>
<li><span class="clue">Wild blither from a space-filling mathematician (7)</span>
<details class="spoiler"><summary>Answer</summary><p><strong>HILBERT</strong>: an anagram (&ldquo;wild&rdquo;) of BLITHER. See the puzzle above.</p></details></li>
<li><span class="clue">Cracked gamine? A puzzle (6)</span>
<details class="spoiler"><summary>Answer</summary><p><strong>ENIGMA</strong>: an anagram (&ldquo;cracked&rdquo;) of GAMINE. The Enigma machine was cracked too.</p></details></li>
</ol>

## Away from the desk

**Photonics.** Before computer architecture, I spent time in Princeton's [Lightwave Lab](https://prucnal.princeton.edu/), which builds neuromorphic photonic chips: hardware that does neural-network-style computing with light. I laid out silicon photonic devices and chips, helped fabricate them in the cleanroom, did FPGA design and wrote analysis software and instrument drivers for experiments, and built an optical setup for a cryostat. I still think it's some of the coolest hardware around.

**On the water, in the choir, on the mat.** I sail in the [Sequoia Yacht Club](https://www.sequoiayc.org/) J-70 league, sing with the [Stanford Chamber Chorale](https://music.stanford.edu/ensembles/chamber-chorale), and train Brazilian jiu-jitsu.

**With my hands.** Woodworking, leatherworking, and electric guitar.

**Otherwise:** hiking and backpacking, reading, crossword puzzles, and travel. I have a soft spot for Hilbert's space-filling curves, Conway's Game of Life, the Enigma machine, and wordplay of any kind, which is more or less how this page happened.

I'll leave you with a space-filling curve.

<svg class="hilbert-anim" data-hilbert-anim role="img" aria-label="A Hilbert curve drawing itself at increasing levels of detail"></svg>

<script src="{{ '/assets/js/hilbert.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/life.js' | relative_url }}" defer></script>
