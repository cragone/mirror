commands = {
    "weather": "weather_display",
    "time": "time_display",
}


def get_command_from_text(text: str):
    words = text.lower().split()

    for word in words:
        if word in commands:
            return commands[word]

    return None
