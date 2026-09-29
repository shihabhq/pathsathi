"""
Generates public/demo/street.mp4: a SYNTHETIC first-person walk down a footpath.
It is only a stand-in so walking mode can be built and tested. Replace it with
real footage filmed at chest height (same file name, no code changes needed).

The scene is timed to lib/demo/timeline.ts and the walker OBEYS each alert:
  t=6   open drain 3 m ahead      -> sidesteps right
  t=13  rickshaw from the right   -> stops and waits, resumes at t=17
  t=20  person 5 m ahead          -> slows down
  t=27  crossing                  -> slows and turns left
Prints the bounding boxes (0 to 1) at those times so timeline.ts can match.

Usage: python scripts/gen-street.py      (needs Pillow and ffmpeg)
"""
import json
import math
import os
import subprocess
from PIL import Image, ImageDraw

W, H, SS = 540, 960, 2  # output size, supersampling factor
FPS, DUR = 24, 32
F = 0.85 * W  # focal length in px
EYE = 1.3  # chest-height camera, metres
SPEED = 1.2  # walking speed, m/s
TURN_DEG = 40  # how far the walker turns left at the crossing

FOOT_L, FOOT_R = -1.6, 1.4  # footpath extents (X)
ROAD_R = 14.0
HAZE = (176, 190, 200)

# Scripted objects (world coords, metres). Z is distance along the walk.
DRAIN = dict(x0=-0.9, x1=0.5, z0=10.0, z1=10.9)
RICKSHAW_Z = 19.6
PERSON = dict(x=-0.3, z=29.0, speed=1.2)
ZEBRA = dict(z0=36.0, z1=40.0)


def rickshaw_x(t):
    return max(1.5, 6.0 - (t - 9.0) * 1.125)  # enters from the right, waits at the kerb (1.5 m at t=13)


def rickshaw_z(t):
    return RICKSHAW_Z + max(0.0, t - 14.0) * 1.6  # pulls away ahead after t=14


def person_z(t):
    return PERSON["z"] + (t - 20.0) * PERSON["speed"]


def fog(c, z):
    k = min(max((z - 6) / 70.0, 0), 0.75)
    return tuple(int(c[i] * (1 - k) + HAZE[i] * k) for i in range(3))


def smooth(a, b, t):
    k = min(max((t - a) / (b - a), 0.0), 1.0)
    return k * k * (3 - 2 * k)


def speed_factor(t):
    stop = 1 - smooth(12.6, 13.3, t) + smooth(16.6, 17.8, t)  # wait for the rickshaw
    person = 1 - 0.4 * (smooth(19, 20, t) - smooth(23, 24, t))  # slow near the person
    turn = 1 - 0.4 * smooth(26.5, 27.5, t)  # slow into the turn
    return min(stop, 1.0) * person * turn


def heading(t):
    return math.radians(TURN_DEG) * smooth(26.8, 30.0, t)  # + = turning left


def build_states():
    """Walker position, heading and step phase for every frame (integrated over time)."""
    states, z, xt, phase, dt = [], 0.0, 0.0, 0.0, 1.0 / FPS
    for n in range(FPS * DUR + 1):
        t = n * dt
        v, h = SPEED * speed_factor(t), heading(t)
        states.append(dict(z=z, x=1.0 * smooth(6.0, 8.2, t) + xt, h=h, v=v, phase=phase))
        z += v * math.cos(h) * dt
        xt -= v * math.sin(h) * dt
        phase += 2 * math.pi * 1.8 * dt * (v / SPEED)
    return states


STATES = build_states()


class Cam:
    def __init__(self, t):
        st = STATES[round(t * FPS)]
        self.t, self.z, self.x, self.h = t, st["z"], st["x"], st["h"]
        amp = 3 * st["v"] / SPEED  # no head bob while standing still
        self.y0 = (0.40 * H + amp * math.sin(st["phase"])) * SS

    def p(self, X, Z, Y=0.0):
        """World (X, Z, Y=height) to supersampled screen coords (yaw = pure camera rotation)."""
        dx, dz = X - self.x, max(Z - self.z, 0.35)
        ang = max(min(math.atan2(dx, dz) + self.h, 1.55), -1.55)
        d = max(math.hypot(dx, dz) * math.cos(ang), 0.35)
        return ((W / 2 + F * math.tan(ang)) * SS, self.y0 + F * (EYE - Y) / d * SS)

    def d(self, Z):
        return Z - self.z


def quad(dr, cam, pts, col):
    dr.polygon([cam.p(*q) for q in pts], fill=col)


def ground(dr, cam, x0, x1, z0, z1, col, y=0.0):
    z0, z1 = max(z0, cam.z + 0.35), z1
    if z1 <= z0:
        return
    quad(dr, cam, [(x0, z0, y), (x1, z0, y), (x1, z1, y), (x0, z1, y)], col)


def building(dr, cam, x, z0, z1, hgt, col, side):
    if z1 - cam.z < 0.4:
        return
    z0c = max(z0, cam.z + 0.35)
    mid = (z0 + z1) / 2
    c = fog(col, mid - cam.z)
    quad(dr, cam, [(x, z0c, 0), (x, z1, 0), (x, z1, hgt), (x, z0c, hgt)], c)
    # windows
    wc = fog((40, 48, 60), mid - cam.z)
    for fl in range(1, int(hgt // 3.2)):
        zz = z0 + 1.0
        while zz + 1.2 < z1:
            if zz > cam.z + 0.6:
                quad(dr, cam, [(x, zz, fl * 3.2), (x, zz + 1.2, fl * 3.2), (x, zz + 1.2, fl * 3.2 + 1.6), (x, zz, fl * 3.2 + 1.6)], wc)
            zz += 2.4
    # shopfront band at street level on the near wall
    if side < 0:
        sc = fog((60, 60, 66) if int(z0) % 16 else (200, 150, 40), mid - cam.z)
        quad(dr, cam, [(x, z0c, 0), (x, z1, 0), (x, z1, 2.6), (x, z0c, 2.6)], sc)


def draw_rickshaw(dr, cam, t):
    x, z = rickshaw_x(t), rickshaw_z(t)
    if cam.d(z) < 0.5:
        return None
    hw = 0.6
    canopy = [(x - hw, z, 1.05), (x + hw, z, 1.05), (x + hw, z, 1.75), (x - hw, z, 1.75)]
    body = [(x - hw, z, 0.35), (x + hw, z, 0.35), (x + hw, z, 1.05), (x - hw, z, 1.05)]
    quad(dr, cam, body, (196, 52, 52))
    quad(dr, cam, canopy, (40, 140, 90))
    for wx in (x - hw, x + hw):
        cx, cy = cam.p(wx, z, 0.33)
        r = 0.33 * F / cam.d(z) * SS
        dr.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(20, 20, 20), outline=(200, 200, 200), width=max(1, int(r / 8)))
    xs = [cam.p(x - hw, z, 0)[0], cam.p(x + hw, z, 0)[0]]
    ys = [cam.p(x, z, 1.75)[1], cam.p(x, z, 0)[1]]
    return xs[0], ys[0], xs[1], ys[1]


def draw_person(dr, cam, t):
    x, z = PERSON["x"], person_z(t)
    if cam.d(z) < 0.5:
        return None
    hw = 0.25
    quad(dr, cam, [(x - hw + 0.05, z, 0), (x + hw - 0.05, z, 0), (x + hw - 0.05, z, 0.85), (x - hw + 0.05, z, 0.85)], (40, 50, 90))
    quad(dr, cam, [(x - hw, z, 0.85), (x + hw, z, 0.85), (x + hw, z, 1.5), (x - hw, z, 1.5)], (230, 190, 60))
    cx, cy = cam.p(x, z, 1.62)
    r = 0.12 * F / cam.d(z) * SS
    dr.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(120, 80, 60))
    return cam.p(x - hw, z, 0)[0], cam.p(x, z, 1.75)[1], cam.p(x + hw, z, 0)[0], cam.p(x, z, 0)[1]


def frame(t):
    cam = Cam(t)
    im = Image.new("RGB", (W * SS, H * SS), HAZE)
    dr = ImageDraw.Draw(im)

    # sky gradient
    hy = int(cam.y0)
    for y in range(0, hy, 4):
        k = y / max(hy, 1)
        c = tuple(int(a * k + b * (1 - k)) for a, b in zip(HAZE, (120, 165, 215)))
        dr.rectangle([0, y, W * SS, y + 4], fill=c)

    # buildings, far to near
    seg = 8.0
    z_start = int(cam.z // seg) * seg
    palette = [(196, 170, 140), (170, 120, 110), (150, 160, 150), (205, 190, 160), (140, 130, 150)]
    for i in range(12, -1, -1):
        z0 = z_start + i * seg
        k = int(z0 / seg)
        building(dr, cam, 12.0 + (k % 3) * 2, z0, z0 + seg, 9 + (k * 7) % 8, palette[(k + 2) % 5], 1)
        building(dr, cam, FOOT_L - 0.2, z0, z0 + seg, 8 + (k * 5) % 9, palette[k % 5], -1)

    # ground
    ground(dr, cam, ROAD_R * -1, ROAD_R, cam.z, cam.z + 90, fog((92, 92, 96), 30))
    ground(dr, cam, FOOT_L, FOOT_R, cam.z, cam.z + 90, fog((198, 186, 166), 30))
    ground(dr, cam, FOOT_R, FOOT_R + 0.18, cam.z, cam.z + 90, fog((235, 235, 235), 25))  # curb
    zz = math.floor(cam.z / 1.2) * 1.2
    while zz < cam.z + 60:  # footpath tile joints: strong motion cue
        ground(dr, cam, FOOT_L, FOOT_R, zz, zz + 0.05, fog((150, 140, 125), zz - cam.z))
        zz += 1.2
    zz = math.floor(cam.z / 6) * 6
    while zz < cam.z + 80:  # road dashes
        ground(dr, cam, 6.9, 7.1, zz, zz + 2.5, fog((235, 235, 235), zz - cam.z))
        zz += 5

    # zebra crossing
    sx = -1.4
    while sx < 11:
        ground(dr, cam, sx, sx + 0.5, ZEBRA["z0"], ZEBRA["z1"], fog((240, 240, 240), ZEBRA["z0"] - cam.z))
        sx += 1.0

    # open drain
    d = DRAIN
    ground(dr, cam, d["x0"], d["x1"], d["z0"], d["z1"], (14, 14, 16), y=0)
    gz = d["z0"]
    while gz < d["z1"]:
        ground(dr, cam, d["x0"], d["x1"], gz, gz + 0.04, (60, 60, 62))
        gz += 0.22

    boxes = {}
    # rickshaw + person (moving)
    r = draw_rickshaw(dr, cam, t)
    p = draw_person(dr, cam, t)

    small = im.resize((W, H), Image.LANCZOS)

    def norm(b):
        if not b:
            return None
        x0, y0, x1, y1 = [v / SS for v in b]
        return [round(max(x0, 0) / W, 2), round(max(y0, 0) / H, 2), round((min(x1, W) - max(x0, 0)) / W, 2), round((min(y1, H) - max(y0, 0)) / H, 2)]

    xs = [cam.p(d["x0"], d["z0"])[0], cam.p(d["x1"], d["z0"])[0]]
    ys = [cam.p(d["x0"], d["z1"])[1], cam.p(d["x0"], d["z0"])[1]]
    boxes["drain"] = norm((xs[0], ys[0], xs[1], ys[1]))
    boxes["rickshaw"] = norm(r)
    boxes["person"] = norm(p)
    zx = [cam.p(-1.4, ZEBRA["z0"])[0], cam.p(11, ZEBRA["z0"])[0]]
    zy = [cam.p(1.4, ZEBRA["z1"])[1], cam.p(1.4, ZEBRA["z0"])[1]]
    boxes["crossing"] = norm((zx[0], zy[0], zx[1], zy[1]))
    return small, boxes


def main():
    out = "public/demo/street.mp4"
    global RICKSHAW_Z
    zt = lambda t: STATES[round(t * FPS)]["z"]
    DRAIN["z0"], DRAIN["z1"] = zt(6) + 3.0, zt(6) + 3.9  # 3 m ahead when the alert fires
    RICKSHAW_Z = zt(13) + 4.0
    PERSON["z"] = zt(20) + 5.0
    ZEBRA["z0"], ZEBRA["z1"] = zt(27) + 3.6, zt(27) + 7.6
    os.makedirs("public/demo", exist_ok=True)
    ff = subprocess.Popen(
        ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
         "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "24", "-movflags", "+faststart", out],
        stdin=subprocess.PIPE,
    )
    report = {}
    for n in range(FPS * DUR):
        t = n / FPS
        im, boxes = frame(t)
        ff.stdin.write(im.tobytes())
        for key, at in (("drain", 6), ("rickshaw", 13), ("person", 20), ("crossing", 27)):
            if n == at * FPS:
                report[key] = boxes[key]
    ff.stdin.close()
    ff.wait()
    print(json.dumps(report, indent=2))


main()
