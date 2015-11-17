//LAST EDIT: 08/09/2015
var gulp = require("gulp");
var streamqueue = require('streamqueue');
var typescript = require("gulp-typescript");
var	pjson = require("./package.json");
//var concat = require("gulp-concat"); maybe for future

var tsProject = typescript.createProject("tsconfig.json", {
	declaration:true
});


gulp.task("src", function () {

	return gulp.src(["src/**/*.ts", "src/**/**/*.ts"]) //lib, and lib/queries. //except lib.d.ts. Maybe for future use:  { base: './src/' }
		.pipe(typescript(tsProject))
		.pipe(gulp.dest("./compiled/"))
		.pipe(gulp.dest("./examples_meteorjs_typescript/packages/npm-container/.npm/package/node_modules/meteor-mysql/compiled/"))
		.pipe(gulp.dest("../Meteor_Projects/taglub/packages/npm-container/.npm/package/node_modules/meteor-mysql/compiled/"));
});

gulp.task("typings", function () {

	return gulp.src(["typings/**/*d.ts"])
		.pipe(gulp.dest("./examples_meteorjs_typescript/typings/"));
});

gulp.task("watchSrc", function () {
	gulp.watch("src/**/*.ts", ['src'])
});

gulp.task("watchTypings", function () {
	gulp.watch("definitely_typed/**/*d.ts", ['typings'])
});

gulp.task("watchAll", ["watchSrc", "watchTypings"], function () {

});

gulp.task("default", ["src", "typings", "watchSrc", "watchTypings"], function () {

})
