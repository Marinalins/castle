var request = require('request-promise');
var cheerio = require('cheerio');

// A partir de l'url de la liste des châteaux, trouve les urls des châteaux en France
async function get_michelin_name(){
  let restaurantNames = [];
  for(var i = 1; i <= 35; i++){
    var url = 'https://restaurant.michelin.fr/restaurants/france/restaurants-1-etoile-michelin/restaurants-2-etoiles-michelin/restaurants-3-etoiles-michelin/page-'+i
    var options = {
        uri: url,
        method: 'GET',
        transform: function(body){
          return cheerio.load(body);
        }
    }
    try{
      var $ = await request(options);

      $('.poi_card-display-title').each(function (j, e) {
          var name = $(this).text();
          name = name.replace(/^\s|\s{2}|\s$/g, '');

          restaurantNames.push(name);
      });
    }catch(err){
      console.error(err);
    }
    process.stdout.write("---Processing " + i + "/35---\r");
  }
  return restaurantNames;
}


async function get(){
  console.log('Retrieving Michelin starred restaurants in France...')
  let restaurantNames = await get_michelin_name();
  console.log('\n\nDONE');
  return restaurantNames;
}

exports.get = get;
