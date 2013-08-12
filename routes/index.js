
/*
 * GET home page.
 */
var fs = require('fs');

module.exports.index = function(req, res){
    res.sendfile( GS.__dirname + '/views/index.html');
};
module.exports.music = function(req, res){
    var ress = ( retFilesOfFolder( '', 'music', GS.__dirname + '/public/resources/music') );
    console.log( ress );
    ress.ok = true;
    res.send( ress );
};

function retFilesOfFolder( fold, name , glPath ){
    var glPath = glPath || '';
    var name = name || fold.substring( fold.lastIndexOf('/') + 1, fold.length)
        , res = { folderName: name, folders: [], files: []};
    var files = fs.readdirSync( glPath + fold );
    files = files || [];
    files.forEach(function(el,i){
        var stat = fs.statSync(glPath + fold + '/' + el);
        if(stat.isDirectory() ){
            res.folders.push( retFilesOfFolder( '/' + el,'',glPath + fold ) );
        }
        else if ( stat.isFile() ){
            if( (/\.mp3$/gi).test(el) )
                res.files.push(el);
        }
    });
    return res;

}