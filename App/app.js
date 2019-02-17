var castle = require('./castle');
var michelin = require('./michelin');

async function is_a_michelin_resto(){
  var result = [];
  console.log('\n------------------------------------------------------------------------\nSTEP 1: Retrieve castles, restaurants and prices from relaischateaux.com\n' +
              '------------------------------------------------------------------------');
  let castles = await castle.get();
  console.log('\n\n------------------------------------------------\nSTEP 2: Retrieve starred restaurants michelin.fr\n' +
              '------------------------------------------------');
  let michelins = await michelin.get();

  console.log('\n\n-----------------------------------------------------------\nSTEP 3: Only keep the castles that have starred restaurants\n' +
              '-----------------------------------------------------------');
  console.log('Checking if the restaurant of the castle is a Michelin starred restaurant...')
  for(var i = 0; i < castles.length; i++){
    for(var j = 0; j < michelins.length; j++){
      if(castles[i].resto === michelins[j]){
        result.push(castles[i]);
      }
    }
    process.stdout.write("---Processing " + i + "/" + castles.length + "---\r");
  }
  console.log('\nFound: ' + result.length + ' results\n');
  return result;
}




async function main(){
  let castles = await is_a_michelin_resto();
  console.log('Ranking castles by price...')
  castles.sort(function(a, b){
    return a.price - b.price;
});
  console.log(castles);
  console.log('\n\nDONE');
}

main();
