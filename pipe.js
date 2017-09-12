// Pipes an initial value through a list of promises.
// Before: Promise.resolve(a).then(b).then(c).then(d);
// After: pipe([b, c, d])(a);
module.exports = fns => init => fns.reduce((p, f) => p.then(f), Promise.resolve(init));
