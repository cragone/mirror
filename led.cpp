#include <gpiod.h>
#include <unistd.h>
#include <iostream>
#include <string>

int main(int argc, char* argv[]){
	if (argc != 2) {
		std::cout << "Usage: ./led -on | -off\n";
		return 1;
	}

	std::string arg = argv[1];

	gpiod_chip *chip = gpiod_chip_open_by_name("gpiochip0");
	if (!chip) {
		std::cerr << "Failed to open gpiochip0\n";
		return 1;
	}
	gpiod_line *line = gpiod_chip_get_line(chip, 17);
	if (!line) {
		std::cerr << "Failed to get GPIO17\n";
		gpiod_chip_close(chip);
		return 1;
	}
	if (gpiod_line_request_output(line, "led", 0) < 0) {
		std::cerr << "Failed to request GPIO17 as output\n";
		gpiod_chip_close(chip);
		return 1;
	}	

	if (arg == "-on") {
		gpiod_line_set_value(line, 1);
		std::cout << "led on\n";
	} else if (arg == "-off"){
		gpiod_line_set_value(line, 0);
		std::cout << "led off\n";
	} else {
		std::cout << "invalid flag\n";
		std::cout << "use -on or -off\n";
	}
	gpiod_chip_close(chip);
	return 0;
}

