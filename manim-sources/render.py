#!/usr/bin/env python3
"""
render.py - rebuilds the home-page background video from scene.py.

    python3 manim-sources/render.py

Needs manim (pip install manim) and ffmpeg. Writes three files into assets/video/:
    home-loop.webm  (VP9, used first by browsers that support it)
    home-loop.mp4   (H.264, the fallback)
    home-loop-poster.jpg  (a still frame: shown while loading and when the visitor asks for reduced motion)
"""
import subprocess                                # runs other programs
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent           # this folder
OUT = HERE.parent / "assets" / "video"           # where the site loads the files from
OUT.mkdir(parents=True, exist_ok=True)           # create the folder if it is missing


def run(cmd):
    print("+", " ".join(str(c) for c in cmd))      # show what is being run
    subprocess.run(cmd, check=True)                # stop with an error if it fails


with tempfile.TemporaryDirectory() as tmp:
    # 1. manim draws the frames (1280x720, 30 fps) into a temporary folder.
    run([sys.executable, "-m", "manim", "-r", "1280,720", "--fps", "30",
         "--media_dir", tmp, "-o", "loop", str(HERE / "scene.py"), "Loop"])
    raw = next(Path(tmp).rglob("loop.mp4"))

    # 2. ffmpeg shrinks it. No audio (-an); faststart lets playback begin before the file has finished downloading.
    run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-an", "-c:v", "libx264", "-preset", "slow",
         "-crf", "30", "-pix_fmt", "yuv420p", "-movflags", "+faststart", OUT / "home-loop.mp4"])
    run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-an", "-c:v", "libvpx-vp9", "-b:v", "0",
         "-crf", "37", "-row-mt", "1", OUT / "home-loop.webm"])
    # 3. One still frame, taken where the magnet scene is fully visible (4.8 s).
    run(["ffmpeg", "-v", "error", "-y", "-ss", "4.8", "-i", raw, "-frames:v", "1",
         "-q:v", "4", OUT / "home-loop-poster.jpg"])

for f in sorted(OUT.glob("home-loop*")):
    print(f"{f.name}: {f.stat().st_size / 1e6:.2f} MB")
