
class Logger {

	quiet() {this.noize = false;}

	info () {
		if (this.noize === false) {return;}
		//use console.error to out put to standard error
		console.error(...arguments);
	}

	debug () {
		if (this.noize === false) {return;}
		if (console.debug) {
			console.debug(...arguments);
		} else {
			console.info(...arguments);
		}
	}


	log () {
		console.log(...arguments);
	}
}

export default new Logger();
