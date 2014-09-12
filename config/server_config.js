
var config = {
	'dev' : {},
	'prod' : {
		'server' : {
			'port' : 3000
		},
		'resources' : {
			'root' : 'C:/Users/sstasishin/Music/all/',
			'dir' : 'C:/Users/sstasishin/Music/all/[curr]',
			'dirExperimental': 'C:/'
		}
	}
};

var cloneObj = function (objToClone) {

	if (typeof objToClone == "number" || typeof objToClone == "string" || typeof objToClone == "boolean") {
		return objToClone;
	}

	if (objToClone instanceof Array) {
		return objToClone.map(function (el) {return el;});
	}

	var result = {};

	if (typeof objToClone == "object") {
		for (var key in objToClone) {
			if (!objToClone.hasOwnProperty(key)) continue;

			result[key] = cloneObj(objToClone[key]);
		}

		return result;
	}

	return objToClone;

};

var buidConfiguration = function (configBase) {
	var builtConfig = cloneObj(configBase);
	var prodConfig = config['prod'];

	for (var key in prodConfig) {
		if (!prodConfig.hasOwnProperty(key)) continue;

		if (!builtConfig[key]) {
			builtConfig[key] = cloneObj(prodConfig[key]);
		}
	}

	return builtConfig;
};

exports.configurate = function (environment) {

	var conf;
	if (environment && environment in config) {
		conf = buidConfiguration(config[environment]);
	}
	else {
		conf = buidConfiguration(config['dev']);
	}

	if (process.argv.length > 2 ) {
		conf.resources.dir = conf.resources.root + process.argv[2];
	}

	console.log(conf);

	return conf;
};