const Ractive = require('ractive');
const fs = require('fs');
let cachedTemplates = {};
let cachedPartials = {};
module.exports = class RactiveView {
    render(name, locals) {
        return new Promise((resolve, reject) => {
            var ractive;
            var _cachedPartials = cachedPartials[name];
            var _cachedTemplates = cachedTemplates[name];
            if (_cachedPartials && _cachedTemplates) {
                if(!locals.ctx[locals.ctx.expdata.expname]) {
                    locals.ctx[locals.ctx.expdata.expname] = {};
                }
                ractive = new Ractive({
                    template: _cachedTemplates,
                    data: {
                        ...locals,
                        ...{
                            state: JSON.stringify(locals.ctx[locals.ctx.expdata.expname])
                        },
                        ...{
                            tdk: locals.ctx.tdk
                        }
                    },
                    partials: _cachedPartials
                });
                return resolve(ractive.toHTML());
            } 
            fs.readFile(name, function(err, data) {
                var reg = /\{\{\>([^\"]*?)\}\}/g;
                var partialsArr = data.toString('utf-8').match(reg);
                var partials = {};
                var templates = data.toString('utf-8');
                partialsArr.forEach(function(arr, i) {
                    partialsArr[i] = arr.replace('{{>', '').replace('}}', '');
                    partials[partialsArr[i]] = getPartials(partialsArr[i].replace(/\./g, '/'));
                });
                if(!locals.ctx[locals.ctx.expdata.expname]) {
                    locals.ctx[locals.ctx.expdata.expname] = {};
                }
                ractive = new Ractive({
                    template: templates,
                    data: {
                        ...locals,
                        ...{
                            state: JSON.stringify(locals.ctx[locals.ctx.expdata.expname])
                        },
                        ...{
                            tdk: locals.ctx.tdk
                        }
                    },
                    partials: partials
                });
                cachedTemplates[name] = templates;
                cachedPartials[name] = partials;
                return resolve(ractive.toHTML());
            })
            function getPartials(filename) {
                var indexnum = __dirname.indexOf('node_modules');
                var url = __dirname.slice(0, indexnum);
                filename = url + 'app/tpl/partials/' + filename + '.html';
                return fs.readFileSync(filename).toString('utf-8');     
            }
        });
    }
     renderString(tpl, locals) {
        return new Promise((resolve, reject) => {
        });
    }
};