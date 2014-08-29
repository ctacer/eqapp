
/*
 * GET home page.
 */
var fs = require('fs');

module.exports.music = function(req, res){
    var path = '/all';//'/resources/music';

    var result = retFilesOfFolder( path, 'C:/Users/sstasishin/Music'/*global.__dirname*/);    
    result.ok = true;
    res.set({
        'Access-Control-Allow-Origin': '*'
    });

    result.path = '/resources/all';
    console.log( result );
    res.send( result );
};

function retFilesOfFolder( fold, glPath, previousPath ){

    previousPath = previousPath || '/resources';

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