"use strict";

var gulp        = require('gulp'),  // Подключаем Gulp
    sass        = require('gulp-sass'), // Подключаем Sass-пакет
    pug         = require('gulp-pug'),               //подключаем PUG (бывш. jade) 
    plumber     = require('gulp-plumber'), //Подключаем Пламбер
    postcss     = require('gulp-postcss'), //Подключаем postcss
    autoprefixer = require('autoprefixer'),  //Подключаем автопрефиксы
    gutil       = require('gulp-util'), //Сжимаем JS-файлы
    minify      = require('gulp-csso'), //Подключаем плагин для сжатия css
    rename      = require('gulp-rename'), //Подключаем плагин для переименования
    imagemin    = require('gulp-imagemin'), //Подключаем плагин для сжатия картинок
    pngquant    = require('imagemin-pngquant'),
    svgmin      = require('gulp-svgmin'), //Подключаем плагин для сжатия svg
    svgstore    = require('gulp-svgstore'), //Подключаем для создания svg-спрайта
    concat      = require('gulp-concat'), // для склеивания файлов
    wiredep     = require('wiredep').stream,
    useref      = require('gulp-useref'), // объединение скриптов js
    uglify      = require('gulp-uglify'), //для сжатия всех скриптов
    mqpacker    = require('css-mqpacker'),
    run         = require('run-sequence'), //Плагин для последовательной работы тасков
    del         = require('del'), //Плагин для удаления файлов
    sourcemaps  = require('gulp-sourcemaps'),
    cache       = require('gulp-cache'), // Подключаем библиотеку кеширования
    rigger      = require('gulp-rigger'), //killer фича :-)
    browserSync = require('browser-sync'); //Подключаем браузер-синк(слежение в браузере)


var path = {
    dest: { //Тут мы укажем куда складывать готовые после сборки файлы
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        php: 'build/php/',
        img: 'build/img/',
        font: 'build/fonts/'
    },
    app: { //Пути откуда брать исходники
        html: 'app/html/', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
        pug: ['app/pug/**/*.pug', '!app/pug/**/_*.pug'], // взять все файлы с расширением pug
        js: 'app/js/main.js',//В стилях и скриптах нам понадобятся только main файлы
        jsLibs: 'app/bower/**/*.js',
        sass: 'app/sass/main.scss',
        cssLibs: 'app/sass/libs.scss',
        php: 'app/php/**/*.php',
        img: ['app/img/**/*.+(jpeg|jpg|png|svg)', '!app/img/svg/*.svg'], //взять файлы jpeg,png,svg
        svg: 'app/img/svg/*.svg', //взять только svg для спрайта
        font: 'app/fonts/**/*.*'
    },
    watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        html: 'app/**/*.html',
        pug: 'app/**/*.pug',
        js: 'app/js/**/*.js',
        php: 'app/php/**/*.php',
        jsLibs: 'app/bower/**/*.js',
        sass: ['app/sass/**/*.scss', '!app/sass/libs.scss'],
        cssLIbs: 'app/sass/libs.scss',
        img: ['app/img/**/*.+(jpeg|jpg|png|svg)', '!app/img/svg/*.svg'],
        svg: 'app/img/svg/*.svg',
        font: 'app/fonts/**/*.*',
        build: 'build/**/*'
    },
    clean: './build'
};
var config = {
    proxy: "main-template:8888",
    notify: false
    };
// обработка стилей SASS
gulp.task("cssChange", function() { //Создаём таск изменения стилей

  gulp.src(path.app.sass)   //Берём файл sass для обработки
    .pipe(plumber()) //Запрещаем ошибкам прерывать скрипт
    .pipe(sass({errLogToConsole: true}))   //Преобразуем Sass в CSS
    .pipe(postcss([  //Добавляем префиксы под разные версии
      autoprefixer({browsers: [
        // "last 2 version",
        // "last 2 Chrome versions",
        // "last 2 Firefox versions",
        // "last 2 Opera versions",
        // "last 2 Edge versions"
        "last 3 version"
      ]}),
      mqpacker({
        sort: true //соеденяем все медиазапросы
      })
    ]))
    .pipe(gulp.dest(path.dest.css))  //Выгружаем результаты в папку dest/css
    .pipe(minify())  //Делаем минификацию кода
    .pipe(rename("main.min.css")) //переименовываем файл style в style.min
    .pipe(gulp.dest(path.dest.css)) //выгружаем в build/css
    .pipe(browserSync.reload({stream: true})); //После сборки делаем перезагрузку страницы
});

gulp.task("cssLibChange", function() {
  gulp.src(path.app.cssLibs)
    .pipe(plumber()) //Запрещаем ошибкам прерывать скрипт
    .pipe(sass({errLogToConsole: true}))   //Преобразуем Sass в CSS
    .pipe(minify())  //Делаем минификацию кода
    .pipe(rename("libs.min.css")) //переименовываем файл style в style.min
    .pipe(gulp.dest(path.dest.css))  //Выгружаем результаты в папку build/css
    .pipe(browserSync.reload({stream: true})); //После сборки делаем перезагрузку страницы
});
gulp.task('pugChange', function() {
   return gulp.src(path.app.pug)        //берём все файлы с расширегнием pug    
  .pipe(plumber())
  .pipe(pug({
    pretty: true
  }))
  .pipe(gulp.dest(path.dest.html))
  .pipe(browserSync.reload({stream: true}));
});

// обработка JS
gulp.task('JsChange', function () {
  gulp.src(path.app.js) //Найдем наш main файл
    .pipe(plumber()) //Запрещаем ошибкам прерывать скрипт
    .pipe(sourcemaps.init()) //Инициализируем sourcemap
    .pipe(uglify()) //Сожмем наш js
    .pipe(sourcemaps.write()) //Пропишем карты
    .pipe(gulp.dest(path.dest.js)) //Выплюнем готовый файл в build
    .pipe(browserSync.reload({stream: true})); //И перезагрузим наш сервер для обновлений
});
// Оптимизируем js-библиотеки
gulp.task("jsLibs", function() {
  return gulp.src(path.app.jsLibs) // взять файл libs.js
  .pipe(concat("libs.min.js")) // объединяем файлы
  .pipe(uglify())  //cжимаем libs.min.js
  .pipe(rename("libs.min.js")) //делаем минификация кода библиотеки
  .pipe(gulp.dest(path.dest.js)) //выгружаем в build/js
  .pipe(browserSync.reload({stream: true}));
});

// Оптимизация картинок
gulp.task('images', function () {
    gulp.src(path.app.img) //Выберем наши картинки
        .pipe(plumber()) //Запрещаем ошибкам прерывать скрипт
        .pipe(cache(imagemin({ //Сожмем их
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        })))
        .pipe(gulp.dest(path.dest.img)) //И бросим в build
        .pipe(browserSync.reload({stream: true})); //И перезагрузим наш сервер для обновлений
});

// Оптимизируем svg картинки и собираем спрайт
gulp.task('svgSymbols', function() {
  return gulp.src(path.app.svg)
    .pipe(plumber())
    // .pipe(svgmin())
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename('svg-symbols.svg'))
    .pipe(gulp.dest(path.dest.img));

});
// Копирует шрифты
gulp.task('copyFont', function() {
    gulp.src(path.app.font)
        .pipe(gulp.dest(path.dest.font))
});
// Копирует php скрипты
gulp.task('copyPhp', function() {
    gulp.src(path.app.php)
        .pipe(gulp.dest(path.dest.php))
});
// веб сервер
gulp.task('webserver', function () {
    browserSync(config);
});
// очистка
gulp.task('clean', function () {
    del(path.clean);
});
gulp.task('clear', function (callback) {
    return cache.clearAll();
});



gulp.task('build', [
    'clean',
    'pugChange',
    'cssLibChange',
    'cssChange',
    'jsLibs', 
    'JsChange',
    'copyPhp',
    'images', 
    'svgSymbols', 
    'copyFont'
]);

gulp.task('watch', function () {               
    gulp.watch([path.watch.pug], function(event, cb) {
        gulp.start('pugChange');
    });
    gulp.watch([path.watch.sass], function(event, cb) {
        gulp.start('cssChange');
    });
    gulp.watch([path.watch.cssLIbs], function(event, cb) {
        gulp.start('cssLibChange');
    });
    gulp.watch([path.watch.js], function(event, cb) {
        gulp.start('JsChange');
    });
    gulp.watch([path.watch.jsLibs], function(event, cb) {
        gulp.start('jsLibs');
    });
    gulp.watch([path.watch.php], function(event, cb) {
        gulp.start('copyPhp');
    });
    gulp.watch([path.watch.img], function(event, cb) {
        gulp.start('images');
    });
    gulp.watch([path.watch.font], function(event, cb) {
        gulp.start('copyFont');
    });
    gulp.watch([path.watch.svg], function(event, cb) {
        gulp.start('svgSymbols');
    });      
});
gulp.task('default', ['build', 'webserver', 'watch']);
// Более наглядный вывод ошибок
var log = function (error) {
  console.log([
    '',
    "----------ERROR MESSAGE START----------",
    ("[" + error.name + " in " + error.plugin + "]"),
    error.message,
    "----------ERROR MESSAGE END----------",
    ''
  ].join('\n'));
  this.end();
};