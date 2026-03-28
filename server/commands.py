from random import choice, random

from annotated_types import T

WEATHER_COMMAND = "weather_display"
TIME_COMMAND = "time_display"
SPEAK_PORTGUESE = "speak_pt"

commands = {
    # english commands
    "weather": WEATHER_COMMAND,
    "whether": WEATHER_COMMAND,
    "time": TIME_COMMAND,
    "clock": TIME_COMMAND,
    "brazil": SPEAK_PORTGUESE,
    "portuguese": SPEAK_PORTGUESE,
    "brazilian": SPEAK_PORTGUESE,
    # portguese commands
    "tempo": WEATHER_COMMAND,
    "hora": TIME_COMMAND,
    "horas": TIME_COMMAND,
    "clima": WEATHER_COMMAND,
    "inglês": SPEAK_PORTGUESE,
}

command_state = {
    WEATHER_COMMAND: False,
    TIME_COMMAND: False,
    SPEAK_PORTGUESE: False,
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
    SPEAK_PORTGUESE: {
        True: ["Mirror agora está falando inglês."],
        False: [
            "mirror now speaking english",
        ],
    },
}

BRAZILIAN_RESPONSES = {
    WEATHER_COMMAND: {
        True: [
            "Mostrando o clima.",
            "Aqui está a previsão.",
            "Clima na tela.",
            "Colocando a previsão na tela.",
            "Agora você pode ver o clima.",
        ],
        False: [
            "Escondendo o clima.",
            "Removendo a previsão.",
            "Clima desligado.",
            "Tirando o clima da tela.",
            "Previsão removida.",
        ],
    },
    TIME_COMMAND: {
        True: [
            "Mostrando o relógio.",
            "Hora na tela.",
            "Relógio visível.",
            "Colocando o horário na tela.",
            "Agora você pode ver a hora.",
        ],
        False: [
            "Escondendo o relógio.",
            "Removendo o horário.",
            "Relógio desligado.",
            "Tirando o horário da tela.",
            "Horário removido.",
        ],
    },
    SPEAK_PORTGUESE: {
        True: ["Espelho agora está falando inglês."],
        False: [
            "mirror now speaking english",
        ],
    },
}

ACKS = ["Okay.", "Got it.", "Alright.", "Are you sure?"]

BRAZILIAN_ACKS = [
    "beleza",
    "tranquilo",
    "tá bom",
    "ok",
    "certo",
    "feito",
    "já foi",
    "pronto",
    "fechou",
    "demorou",
    "valeu",
    "boa",
    "é isso",
    "show",
    "top",
    "perfeito",
    "mandou bem",
    "tamo junto",
    "bora",
    "partiu",
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


def mirrorResponse(command: str, lang: str = "en") -> str:
    state = command_state[command]

    if command_state[SPEAK_PORTGUESE]:
        ack = choice(BRAZILIAN_ACKS)
        action = choice(BRAZILIAN_RESPONSES[command][state])
    else:
        ack = choice(ACKS)
        action = choice(RESPONSES[command][state])

    if random() < 0.5:
        return f"{ack} {action}"
    return action
