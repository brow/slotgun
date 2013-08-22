#Slotgun

Slotgun helps you snatch up coveted office hours at [1871](http://1871.com/) using [Slottd](http://slottd.com/). 

Run it as an SMTP server and forward your 1871 list mail to it. It'll parse out any announced office hours, find them on Slottd, and (if desired) book them for you faster than any human could.

## Setup
1. Install [node.js](http://nodejs.org/).
2. Modify `bin/server.js` with your desired office hours.
3. Make sure your port 25 is open.
4. `sudo node bin/server.js `

## Testing
	$ mocha
	
	  ․․․․․․․․․․․․․․․․․․
	
	  18 tests complete (325 ms)
	  1 test pending
