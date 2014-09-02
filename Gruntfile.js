module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    concat: {
      options: {
        separator: "\n",
      },
      dist: {
        src: ['public/javascripts/config.js', 'public/javascripts/helper.js', 'public/javascripts/file_loader.js', 'public/javascripts/playlist.js', 'public/javascripts/player_model.js', 'public/javascripts/player_view.js', 'public/javascripts/player.js', 'public/javascripts/main.js'],
        dest: "build/<%= pkg.name %>.js"
      }
    },

    jshint: {
      options: {
        jshintrc: true,
        reporter: require('jshint-stylish')
      },
      all: ['build/<%= pkg.name %>.js']
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      dist: {
        src: 'build/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },

    traceur: {
      options: {
        experimental: true,
        sourceMap: true,
        blockBinding: true,
        includeRuntime: true
      },
      custom: {
        files: [{
          expand: true,
          cwd: 'public/javascripts/es6',
          src: ['*.js'],
          dest: 'build'
        }]
      }
    }

  });

  require('load-grunt-tasks')(grunt);

  // Default task(s).
  grunt.registerTask('default', ['concat', 'jshint', 'uglify']);
  grunt.registerTask('traceur', ['traceur']);

};