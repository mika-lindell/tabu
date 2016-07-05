module.exports = function(grunt) {

  grunt.initConfig({

    // Linting
    jshint: {
      files: ['Gruntfile.js'],
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
                bare: false,
                join: true // This will make sure you can create class structure in different files
              },
        files: [
          {                         
            'dist/scripts/app.js': [

              'src/**/Binding.coffee',
              'src/**/HTMLElement.coffee',
              'src/**/DataGetter.coffee',
              'src/**/DataStorage.coffee',
              'src/**/ItemCard.coffee',
              'src/**/ItemCardHeading.coffee',
              'src/**/ItemCardList.coffee',
              'src/**/Helpers.coffee',
              'src/**/Render.coffee',
              'src/**/App.coffee',
              'src/**/Main.coffee',

            ] // concat then compile into single file 
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
            cwd: 'tests/coffee',        // Src matches are relative to this path.
            src: ['**/*.coffee'], // Actual pattern(s) to match.
            dest: 'tests/js',      // Destination path prefix.
            ext: '.js',       // Dest filepaths will have this extension.
            extDot: 'first'     // Extensions in filenames begin after the first dot
          }
        ] 
      }
    },

    // test runner
    nightwatch: {
      options: {
        // task options
        standalone: false,
        workers: true,

        // download settings
        jar_version: '2.53.0',
        jar_path: 'lib/selenium-server-standalone-2.53.0.jar',

        src_folders: ['tests/js'],
        output_folder: 'report',
        globals_path: 'tests/js/globals.js', 


        test_settings: {
          default: {
            desiredCapabilities: {
              'browserName': "chrome",
              'silent': true,
              'chromeOptions' : {
                'args': ['start-maximized', 'load-extension=' + process.cwd() + '/dist/']
              }
            }
          }
        },
        selenium: {
          start_process : true,
          log_path : "logs/",
          host : "127.0.0.1",
          port : 4444,
          cli_args : {
            'webdriver.chrome.driver' : "node_modules/chromedriver/lib/chromedriver/chromedriver.exe",
          }
        }
      },
      custom: {
      }
    },

    // Copy some assets from npm_modules to dist
    copy: {
      assets: {
        files: [
          // includes files within path
          {
            expand: true,
            cwd:'node_modules/materialize-css/dist/font/',
            src: ['**'],
            dest: './dist/styles/assets/'
          },
        ],
      },
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
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.loadNpmTasks('grunt-haml2html');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-sass');

  grunt.loadNpmTasks('grunt-nightwatch');

  // This will enable forcing tasks (to not exit on warnings) with 'force:' -prefix
  grunt.loadNpmTasks('grunt-force-task');

  grunt.registerTask('default', [
    'copy:assets', 
    'jshint', 
    'haml', 
    'coffee', 
    'sass', 
    'force:nightwatch', 
    'watch'
    ]);



};
