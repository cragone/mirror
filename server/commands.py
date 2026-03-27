WEATHER_COMMAND = "weather display"
TIME_COMMAND = "time display"

commands = {
    "weather": WEATHER_COMMAND,
    "whether": WEATHER_COMMAND,
    "time": TIME_COMMAND,
}

command_state = {
    WEATHER_COMMAND: False,
    TIME_COMMAND: False,
}


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


def mirrorResponse(command: str):
    if command_state[command]:
        return "turning" + command + "on"
    else:
        return "turning" + command + "off"
