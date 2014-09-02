
// greeter.js
class Greeter {
  sayHi(name = 'Anonymous') {
    console.log(`Hi ${name}!`);
  }
}

var square = (x) => {
  return x * x;
};

console.log(square(2));

var greeter = new Greeter();
greeter.sayHi();

var [a, [b, c], d] = ['hello', [', ', 'junk'], ['world']];
console.log("'" + a + "'" + b + "'" + c + "'" + d + "'");

function timeout(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
timeout(100).then(() => {
  console.log('done');
});