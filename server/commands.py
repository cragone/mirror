from random import choice, random

WEATHER_COMMAND = "weather_display"
TIME_COMMAND = "time_display"

commands = {
    "weather": WEATHER_COMMAND,
    "whether": WEATHER_COMMAND,
    "time": TIME_COMMAND,
    "clock": TIME_COMMAND,
}

command_state = {
    WEATHER_COMMAND: False,
    TIME_COMMAND: False,
}

RESPONSES = {
    WEATHER_COMMAND: {
        True: [
            "Showing the weather.",
            "Here’s the forecast.",
            "Weather is up.",
            "Putting the forecast on screen.",
            "You’ve got the weather now.",
        ],
        False: [
            "Hiding the weather.",
            "Removing the forecast.",
            "Weather is off.",
            "Taking the weather down.",
            "Forecast cleared.",
        ],
    },
    TIME_COMMAND: {
        True: [
            "Showing the clock.",
            "Time is up.",
            "Clock is on screen.",
            "Putting the time up.",
            "You can see the time now.",
        ],
        False: [
            "Hiding the clock.",
            "Removing the time display.",
            "Clock is off.",
            "Taking the time down.",
            "Time display cleared.",
        ],
    },
}

ACKS = [
    "Okay.",
    "Got it.",
    "Sure.",
    "Alright.",
]


def getCommandFromText(text: str):
    words = text.lower().split()
    for word in words:
        if word in commands:
            return commands[word]
    return None


def toggleCommand(command: str) -> bool:
    """Toggle state and return the new value."""
    if command in command_state:
        command_state[command] = not command_state[command]
    return command_state[command]


def getState() -> dict:
    return dict(command_state)


def mirrorResponse(command: str) -> str:
    state = command_state[command]
    action = choice(RESPONSES[command][state])
    ack = choice(ACKS)

    if random() < 0.5:
        return f"{ack} {action}"
    return action
