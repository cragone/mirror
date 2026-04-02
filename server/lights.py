import subprocess

def turnLightOn():
    subprocess.run(["./led", "-on"])


def turnLightOff():
    subprocess.run(["./led", "-off"])
    
