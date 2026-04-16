import base64

# A 1x1 pixel fully transparent PNG
transparent_png_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=="

with open("assets/iconos/empty.png", "wb") as f:
    f.write(base64.b64decode(transparent_png_base64))
