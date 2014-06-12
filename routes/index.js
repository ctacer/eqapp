
/*
 * GET home page.
 */
var fs = require('fs');

module.exports.index = function(req, res){
    res.sendfile( global.__dirname + '/views/index.html');
};
module.exports.music = function(req, res){
    var path = '/resources/music';

    var result = retFilesOfFolder( path, global.__dirname + '/public');
    console.log( result );
    result.ok = true;
    res.send( result );
};

function retFilesOfFolder( fold, glPath, previousPath ){

    previousPath = previousPath || '';

    var glPath = glPath || '';
    var name = fold.substring( fold.lastIndexOf('/') + 1, fold.length);
    var res = { folderName: name, folders: [], files: [], path : previousPath + fold };

    var files = fs.readdirSync( glPath + fold );
    files = files || [];
    files.forEach(function(el,i){
        var stat = fs.statSync(glPath + fold + '/' + el);
        if(stat.isDirectory() ){
            res.folders.push( retFilesOfFolder( '/' + el, glPath + fold, res.path ) );
        }
        else if ( stat.isFile() ){
            if( (/\.mp3$/gi).test(el) )
                res.files.push(el);
        }
    });
    return res;

}