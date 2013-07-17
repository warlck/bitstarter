#!/usr/bin/env node

var fs = require('fs');
var rest = require('restler');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
	var instr = infile.toString();
	if(!fs.existsSync(instr)) {
		console.log("%s does not exist. Exiting.", instr);
		process.exit(1); 
	}

	return instr;
};

var cheerioHtmlFile = function(htmlfile) {
	return cheerio.load(fs.readFileSync(htmlfile));
}

var loadChecks = function(checksfile) {
	return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
	$ = cheerioHtmlFile(htmlfile);
	var checks = loadChecks(checksfile).sort();
	var out = {};
	for (var li in checks) {
		var present = $(checks[li]).length > 0;
		out[checks[li]] = present;
	}
	return out;
};


var clone = function(fn) {
	return fn.bind({});
};

var printResult = function(checkJson) {
	var outJson = JSON.stringify(checkJson, null, 4);
	console.log(outJson);
}

var cheerioHtml = function (string) {
	return cheerio.load(string);
}

var checkHtml = function(html, checksfile) {
	$ = cheerioHtml(html);
	var checks = loadChecks(checksfile).sort();
	var out = {};
	for (var li in checks) {
		var present = $(checks[li]).length > 0;
		out[checks[li]] = present;
	}
	return out;
};

if(require.main == module ) {
	program
		.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
		.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
		.option('-u, --url <url>', 'URL of the page to be checked')
		.parse(process.argv);

		if (program.url) {
			 rest.get(program.url).on('complete', function(result) {
			  if (result instanceof Error) {
			    sys.puts('Error: ' + result.message);
			    this.retry(5000); // try again after 5 sec
			  } else {
			  	var checkJson = checkHtml(result.toString(), program.checks);
				printResult(checkJson);
			  }
			});
		}
		else if (program.file)  {	
			var checkJson = checkHtmlFile(program.file, program.checks);
			printResult(checkJson);
		}
	} else {
		exports.checkHtmlFile = checkHtmlFile;
	}
