/*  CrossRoads Timeclock  */
#include <FastLED.h>

#define LED_PIN     5
#define NUM_LEDS    33
#define BRIGHTNESS  64
#define LED_TYPE    WS2811
#define COLOR_ORDER GRB
CRGB leds[NUM_LEDS];

#define UPDATES_PER_SECOND 100

unsigned long previousTime = 0;
byte seconds ;
byte minutes ;
byte hours ;
void setup()
{
Serial.begin (9600);
}

void loop ()
{
// I  think using microseconds is even more accurate
  if (millis() >= (previousTime)) 
  {
     previousTime = previousTime + 1000;  // use 100000 for uS
     seconds = seconds +1;
     if (seconds == 60)
     {
        seconds = 0;
        minutes = minutes +1;
     }
     if (minutes == 60)
     {
        minutes = 0;
        hours = hours +1;
     }
     if (hours == 13)
     {
        hours = 1;
     }
  Serial.print (hours, DEC);
  Serial.print (":");
  Serial.print (minutes,DEC);
  Serial.print (":");
  Serial.println(seconds,DEC);
  } // end 1 second
} // end loop
