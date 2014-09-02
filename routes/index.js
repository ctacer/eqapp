
/*
 * GET home page.
 */
var fs = require('fs');

module.exports.music = function(req, res){
    var path = '';

    var result = getHierarchicalFileList(path, global.config.resources.dir);    
    result.ok = true;
    res.set({
        'Access-Control-Allow-Origin': '*'
    });

    result.path = '/resources' + path;
    result.folderName = 'music';
    console.log( result );
    res.send( result );
};

module.exports.resources = function(req, res){
    var path = { 
        relative: '/resources', 
        global: global.config.resources.dir
    };

    var result = getFileList('', path);
    res.send({ ok: true, list: result });
};

function getHierarchicalFileList (fold, glPath, previousPath) {

    previousPath = previousPath || '/resources';

    var glPath = glPath || '';
    var name = fold.substring( fold.lastIndexOf('/') + 1, fold.length);
    var res = { folderName: name, folders: [], files: [], path : previousPath + fold };

    var files = fs.readdirSync( glPath + fold );
    files = files || [];
    files.forEach(function(el,i){
        var stat = fs.statSync(glPath + fold + '/' + el);
        if(stat.isDirectory() ){
            res.folders.push( getHierarchicalFileList( '/' + el, glPath + fold, res.path ) );
        }
        else if ( stat.isFile() ){
            if( (/\.mp3$/gi).test(el) )
                res.files.push(el);
        }
    });
    return res;

}

function getFileList (folder, pathObject) {

    var list = [];
    var directoryComponents = fs.readdirSync(pathObject.global + folder);
    directoryComponents = directoryComponents || [];

    directoryComponents.forEach(function(component, index){
        var stat = fs.statSync(pathObject.global + folder + '/' + component);
        if(stat.isDirectory()){
            list = list.concat(getFileList(folder + '/' + component, pathObject));
        }
        else if (stat.isFile() && (/\.mp3$/gi).test(component)) {
            list.push(pathObject.relative + folder + '/' + component);
        }
    });
    return list;
}