module.exports = function(grunt) {

  grunt.initConfig({

    // Linting
    jshint: {
      files: ['Gruntfile.js', 'karma.conf.js'],
      // options: {
      //   globals: {
      //     jQuery: true
      //   }
      // }
    },

    // Haml compiler, requires Ruby with HAML to be installed.
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

    // Sass compiler, requires Ruby with SASS to be installed.
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

    // Coffeescript compiler.
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
      },

      tests: {
        options: {
                bare: true
              },
        files: [
          {                         
            expand: true,       // Enable dynamic expansion.
            cwd: 'tests/',        // Src matches are relative to this path.
            src: ['**/*.coffee'], // Actual pattern(s) to match.
            dest: 'tests/js',      // Destination path prefix.
            ext: '.js',       // Dest filepaths will have this extension.
            extDot: 'first'     // Extensions in filenames begin after the first dot
          }
        ] 
      }
    },

    // E2E-tests runner
    nightwatch: {
      options: {
        // task options
        standalone: false,
        workers: true,

        // download settings
        jar_version: '2.53.0',
        jar_path: 'lib/selenium-server-standalone-2.53.0.jar',
        //jar_url: 'http://domain.com/files/selenium-server-standalone-1.2.3.jar',

        // nightwatch settings
        //globals: { foo: 'bar' },
        //globals_path: 'custom_tests/globals',
        //custom_commands_path: 'custom_tests/helpers',
        //custom_assertions_path: 'custom_tests/asserts',
        src_folders: ['tests/'],
        output_folder: 'report',
        test_settings: {
          end_session_on_fail: false
        },
        selenium: {}
      },
      custom: {
        // custom target + overrides
        //config_path: '/path/to/file.json',
        //src_folders: ['other_tests/nightwatch']
      }
    },

    // File watch for lint, compilers and nightwatch e2e -tests
    watch: {
      lint: {
        files: ['<%= jshint.files %>'],
        tasks: ['jshint']
      },
      templates: {
        files: ['src/**/*.haml'],
        tasks: ['haml', 'nightwatch']
      },
      styles: {
        files: ['src/**/*.scss'],
        tasks: ['sass', 'nightwatch']
      },
      scripts: {
        files: ['src/**/*.coffee'],
        tasks: ['coffee:dist', 'nightwatch']
      },
      tests: {
        files: ['tests/**/*.coffee'],
        tasks: ['coffee:tests', 'nightwatch']
      }      
    }

  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.loadNpmTasks('grunt-haml2html');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-sass');

  grunt.loadNpmTasks('grunt-nightwatch');

  // This will enable forcing tasks (to not exit on warnings) with 'force:' -prefix
  grunt.loadNpmTasks('grunt-force-task');

  grunt.registerTask('default', ['jshint', 'haml', 'coffee', 'sass', 'force:nightwatch', 'watch']);

};
