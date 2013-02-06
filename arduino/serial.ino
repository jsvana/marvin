#include "QueueList.h"
#include "aJSON.h"

#include "types.h"

int incomingByte;
boolean lights[10];
QueueList<char> command;
char input[256];

void set(int type, int number, boolean status, boolean &error) {
	if (type == TYPE_LIGHT) {
		if (number >= 0 && number <= 9) {
			if (status) {
				digitalWrite(number, HIGH);
			} else {
				digitalWrite(number, LOW);
			}

			lights[number] = status;
		} else {
			error = true;
		}
	}
}

boolean toggle(int type, int number, boolean &error) {
	if (type == TYPE_LIGHT) {
		if (number >= 0 && number <= 9) {
			if (lights[number]) {
				digitalWrite(number, LOW);
				lights[number] = false;
			} else {
				digitalWrite(number, HIGH);
				lights[number] = true;
			}

			return lights[number];
		}
	}

  error = true;

	return false;
}

int retrieve(int type, int number, boolean &error) {
	int val;

	if (type == TYPE_LIGHT) {

	} else if (type == TYPE_ANALOG) {
		if (number >= 0 && number <= 5) {
			val = analogRead(number);

			return val;
		} else {
			error = true;
			return -1;
		}
	} else {
		return -1;
	}
}

void handleCommand(aJsonObject *json) {
	int c = aJson.getObjectItem(json, "c")->valueint;
	int t = aJson.getObjectItem(json, "t")->valueint;
	int num, analogVal;
	boolean error = false;
	boolean status;

	if (c == COMMAND_SET) {
		if (t == TYPE_LIGHT) {
			num = aJson.getObjectItem(json, "n")->valueint;
			status = aJson.getObjectItem(json, "d")->valuebool;
			set(t, num, status, error);

			if (error) {
				Serial.print("{\"e\":true,\"c\":");
				Serial.print(c);
				Serial.print(",\"t\":");
				Serial.print(t);
				Serial.print(",\"n\":");
				Serial.print(num);
				Serial.println("}");
			} else {
				Serial.print("{\"e\":false,\"c\":");
				Serial.print(c);
				Serial.print(",\"t\":");
				Serial.print(t);
				Serial.print(",\"n\":");
				Serial.print(num);
				Serial.print(",\"d\":");
				Serial.print(status ? "true" : "false");
				Serial.println("}");
			}
		}
	} else if (c == COMMAND_TOGGLE) {
		if (t == TYPE_LIGHT) {
			num = aJson.getObjectItem(json, "n")->valueint;
			status = toggle(t, num, error);

			if (error) {
				Serial.print("{\"e\":true,\"c\":");
				Serial.print(c);
				Serial.print(",\"t\":");
				Serial.print(t);
				Serial.print(",\"n\":");
				Serial.print(num);
				Serial.println("}");
			} else {
				Serial.print("{\"e\":false,\"c\":");
				Serial.print(c);
				Serial.print(",\"t\":");
				Serial.print(t);
				Serial.print(",\"n\":");
				Serial.print(num);
				Serial.print(",\"d\":");
				Serial.print(status ? "true" : "false");
				Serial.println("}");
			}
		}
	} else if (c == COMMAND_RETRIEVE) {
		if (t == TYPE_LIGHT) {

		} else if (t == TYPE_ANALOG) {
			num = aJson.getObjectItem(json, "n")->valueint;

			analogVal = retrieve(t, num, error);

			if (error) {
				Serial.print("{\"e\":true,\"c\":");
				Serial.print(c);
				Serial.print(",\"t\":");
				Serial.print(t);
				Serial.print(",\"n\":");
				Serial.print(num);
				Serial.println("}");
			} else {
				Serial.print("{\"e\":false,\"c\":");
				Serial.print(c);
				Serial.print(",\"t\":");
				Serial.print(t);
				Serial.print(",\"n\":");
				Serial.print(num);
				Serial.print(",\"d\":");
				Serial.print(analogVal);
				Serial.println("}");
			}
		}
	}
}

void setup() {
  int i;

  for (i = 0; i < 10; i++) {
    lights[i] = false;
    pinMode(i, OUTPUT);
  }

  Serial.begin(9600);
  Serial.flush();
}

void loop() {
}

void serialEvent() {
  char request;
  char type;
  char number;

  boolean error = false;
  boolean result;
	int i, len;
	int c;
	int t;
	aJsonObject *root;

  if (Serial.available() > 0) {
		if (Serial.peek() == '\n') {
			if (command.count() < 256) {
				len = command.count();

				for (i = 0; command.count() > 0; i++) {
					input[i] = command.pop();
				}

				input[len] = '\0';

				Serial.read();

				root = aJson.parse(input);

				handleCommand(root);

				aJson.deleteItem(root);
			} else {
				while (command.count() > 0) {
					command.pop();
				}
			}
		} else {
			command.push(Serial.read());
		}
  }
}

