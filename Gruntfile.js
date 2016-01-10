module.exports = function(grunt) {

  grunt.initConfig({

    jshint: {
      files: ['Gruntfile.js'],
      // options: {
      //   globals: {
      //     jQuery: true
      //   }
      // }
    },

    haml: {
      dist: {
        files: [
          {                         
            expand: true,       // Enable dynamic expansion.
            cwd: 'src/',        // Src matches are relative to this path.
            src: ['**/*.haml'], // Actual pattern(s) to match.
            dest: 'dist/',      // Destination path prefix.
            ext: '.html',       // Dest filepaths will have this extension.
            extDot: 'first'     // Extensions in filenames begin after the first dot
          }
        ] 
      }
      //,
      // dev: {                             // Another target
      //   options: {                       // Target options
      //     //bundleExec: true,
      //     style: 'expanded'
      //   },
      //   files: [ 
      //     {
      //       expand: true,       // Enable dynamic expansion.
      //       cwd: 'src/',        // Src matches are relative to this path.
      //       src: ['**/*.haml'], // Actual pattern(s) to match.
      //       dest: 'dev/',      // Destination path prefix.
      //       ext: '.html',       // Dest filepaths will have this extension.
      //       extDot: 'first'     // Extensions in filenames begin after the first dot

      //     }
      //   ] 
      //  }
    },

    coffee: {
      dist: {
        options: {
                bare: true
              },
        files: [
          {                         
            expand: true,       // Enable dynamic expansion.
            cwd: 'src/',        // Src matches are relative to this path.
            src: ['**/*.coffee'], // Actual pattern(s) to match.
            dest: 'dist/',      // Destination path prefix.
            ext: '.js',       // Dest filepaths will have this extension.
            extDot: 'first'     // Extensions in filenames begin after the first dot
          }
        ] 
      }
    },

    sass: {
      dist: {
        files: [
          {                         
            expand: true,       // Enable dynamic expansion.
            cwd: 'src/',        // Src matches are relative to this path.
            src: ['**/*.scss'], // Actual pattern(s) to match.
            dest: 'dist/',      // Destination path prefix.
            ext: '.css',       // Dest filepaths will have this extension.
            extDot: 'first'     // Extensions in filenames begin after the first dot
          }
        ] 
      }
    },

    watch: {
      lint: {
        files: ['<%= jshint.files %>'],
        tasks: ['jshint']
      },
      templates: {
        files: ['src/**/*.haml'],
        tasks: ['haml']
      },
      scripts: {
        files: ['src/**/*.coffee'],
        tasks: ['coffee']
      },
      styles: {
        files: ['src/**/*.scss'],
        tasks: ['sass']
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.loadNpmTasks('grunt-haml2html');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-sass');

  grunt.registerTask('default', ['lint', 'haml', 'coffee', 'sass', 'watch']);

};
