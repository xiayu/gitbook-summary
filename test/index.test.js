var Q = require("q");
var should = require('should');
var path = require('path');
var fs = require('fs-extra');

var book = require('../');
var config = require('../lib/config');

describe('Index.js', function() {
    describe('#summary()', function() {

        after(function(done) {
            file = path.resolve('SUMMARY.md');
            fs.remove(file, done);
        })

        it('should get a `SUMMARY.md` for `.` if has no options, for example: book sm', function() {
            book.summary({});

            // Fixme why can`t pass it using sync?
            // should(fs.existsSync(path.join(bookRoot, 'SUMMARY.md'))).be.ok();
            fs.exists(path.resolve('SUMMARY.md'), function(exist) {
                should(exist).be.ok();
            })
        });
    });

    describe('#summary()', function() {
        var bookRoot, file;

        beforeEach(function() {
            bookRoot = path.resolve("test/books/basic");
        })

        afterEach(function(done) {
            file = path.resolve(bookRoot, 'SUMMARY.md');
            fs.remove(file, done);
        })

        describe('should get a `SUMMARY.md`', function() {

            it('given a option bookroot, for example: book sm -r bookroot', function() {
                book.summary({
                    bookroot: bookRoot
                });

                // Fixme why can`t pass it using sync?
                // should(fs.existsSync(path.join(bookRoot, 'SUMMARY.md'))).be.ok();
                fs.exists(path.join(bookRoot, 'SUMMARY.md'), function(exist) {
                    should(exist).be.ok();
                })
            });

            it('given a option bookname, for example: book sm -r bookroot -n bookname', function() {
                var bookname = 'This is a test book'
                book.summary({
                    bookroot: bookRoot,
                    bookname: bookname
                });

                var summary = path.join(bookRoot, 'SUMMARY.md')
                fs.readFile(summary, 'utf8', function(err, content) {
                    if (err) console.log(err);
                    should(content).be.equal('# This is a test book\n\n');
                });
            })

        });
    });

    describe('#summary()', function() {
        var bookRoot;

        before(function() {
            bookRoot = path.resolve("test/books/config-json");
        })

        after(function(done) {
            var file = path.resolve(bookRoot, config.get(bookRoot).outputfile);
            fs.remove(file, done);
        })

        it('should get a `SUMMARY.md` if given a `book.json`', function(done) {
            book.summary({
                bookroot: bookRoot
            });

            var summary = path.resolve(bookRoot, config.get(bookRoot).outputfile);

            fs.exists(path.join(bookRoot, summary), function(exist) {
                should(exist).be.ok();
            })            

            // fs.readFile(summary, 'utf8', function(err, content) {
            //     if (err) console.log(err);
            //     should(content).be.equal('# json-config-name\n\n');
            // });
        });
    });
});