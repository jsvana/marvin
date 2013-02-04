#include "QueueList.h"
#include "aJSON.h"

int incomingByte;
boolean lights[10];
QueueList<char> command;
char input[256];

boolean toggle(char type, int number, boolean &error) {
  switch (type) {
    case 'l':
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
      break;
  }

  error = true;
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
				Serial.println(aJson.getObjectItem(root, "test")->valuestring);
			} else {
				while (command.count() > 0) {
					command.pop();
				}
			}
		} else {
			command.push(Serial.read());
		}

/*    if (command.count() >= 3) {
      request = command.pop();
      type = command.pop();
      number = command.pop();

     if (request == 'r') {
        if (number >= '0' && number <= '9') {
          Serial.print("r");
          Serial.print(type);
          Serial.print(number - '0');
          Serial.println(lights[number - '0'] ? "+" : "-");
        } else {
          Serial.println("e");
        }
      } else {
        if (number >= '0' && number <= '9') {
          result = toggle(type, number - '0', error);

          if (error) {
            Serial.println("e");
          } else {
            Serial.print(type);
            Serial.print(number);
            Serial.println(result ? "+" : "-");
          }
        } else {
          Serial.println("e");
        }
      }
    }*/
  }
}

