int incomingByte;
boolean lights[10];

void setup() {
  int i;

  for (i = 0; i < 10; i++) {
    lights[i] = false;
    pinMode(i, OUTPUT);
  }

  Serial.begin(9600);
}

void loop() {
  char request;
  char type;
  char numChar;
  int i;
  int number = -1;
  boolean error = false;
  boolean result;

  if (Serial.available() > 0) {
    if (Serial.available() % 3 == 0) {
      while (Serial.available() > 0) {
        request = Serial.read();
        type = Serial.read();
        numChar = Serial.read();
  
        if (numChar >= '0' && numChar <= '9') {
          number = numChar - '0';
        }
  
        if (number < 0 || number > 9 || type != 'l') {
          Serial.println("e");
        } else {
          Serial.print("r");
          Serial.print(type);
          Serial.print(number);
          Serial.println(lights[number] ? "+" : "-");
        }
      }
    } else if (Serial.available() % 2 == 0) {
      while (Serial.available() > 0) {
        type = Serial.read();
        numChar = Serial.read();
  
        if (numChar >= '0' && numChar <= '9') {
          number = numChar - '0';
        }
  
        if (number != -1) {
          result = toggle(type, number, error);
        }
  
        if (error) {
          Serial.println("e");
        } else {
          Serial.print(type);
          Serial.print(number);
          Serial.println(result ? "+" : "-");
        }
      }
    } else if (Serial.available() == 1) {
      request = Serial.read();

      if (request == 'r') {
        for (i = 0; i < 10; i++) {
          lights[i] = false;
        }
      }
    } else {
      while (Serial.available() > 0) {
        Serial.read();
      }
    }


  }

  delay(250);
}

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
