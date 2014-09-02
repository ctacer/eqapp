
var config = {
	'dev' : {},
	'prod' : {
		'server' : {
			'port' : 3000
		},
		'resources' : {
			'dir' : 'C:/Users/sstasishin/Music/all/last',
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

	console.log(conf);

	return conf;
};