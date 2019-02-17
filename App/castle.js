var request = require('request-promise');
var cheerio = require('cheerio');

// A partir de l'url de la liste des châteaux, trouve les urls des châteaux en France
async function get_castle_url(){
  let urls = [];
  var options = {
      uri: 'https://www.relaischateaux.com/fr/site-map/etablissements',
      method: 'GET',
      transform: function(body){
        return cheerio.load(body);
      }
  }
  try{

    var $ = await request(options);

    $('div#countryF + #countryF').children('ul.listDiamond').children('li').each(function (i, e) {
        var a = $(this).children('a');
        urls[i] = a.attr('href');
        process.stdout.write("---Processing " + i + "/?---\r");
    });
    process.stdout.write("---Processing " + urls.length + "/?---\r");
    console.log('\nFound: ' + urls.length + ' castles in France\n');

  }catch(err){
    console.error(err);
  }

  return urls;
}


// A partir des urls des châteaux en France, retourne les châteaux qui font hôtel et restaurant
async function get_hotelAndRestaurant(urls){
  let filteredUrls = [];
  for(var i = 0; i < 10; i++){
    var options = {
        uri: urls[i],
        method: 'GET',
        transform: function(body){
          return cheerio.load(body);
        }
    }
    try{
      var $ = await request(options);

      var castle = $('.jsSecondNavMain').children('li').first().children('a');
      if(castle.attr('data-id') === 'isProperty'){
        filteredUrls.push(urls[i]);
        process.stdout.write("---Processing " + i + "/" + urls.length + "---\r");
      }

    }catch(err){
      //console.error(err);
    }
  }
  console.log('\nFound: ' + filteredUrls.length + ' castles that have restaurants\n');
  return filteredUrls;
}


// A partir de l'url d'un château, retourne le nom du restaurant du château
async function get_restaurant_name(url){
    // get the url to open the tag Restaurant
    var urlOngletResto;
    var options = await{
        uri: url,
        method: 'GET',
        transform: function(body){
          return cheerio.load(body);
        }
    }
    try{
      var $ = await request(options);
      urlOngletResto = $('.jsSecondNavMain').children('li').first().next().children('a').attr('href');

    }catch(err){
      console.error(err);
    }

    // Get the name of the first restaurant
    var name;
    var options = {
        uri: url,
        method: 'GET',
        transform: function(body){
          return cheerio.load(body);
        }
    }
    try{
      var $ = await request(options);
      name = $('.hotelTabsHeaderTitle').children('h3').text();
      name = name.replace(/^\s|\s{2}|\s$/g, '');
    }catch(err){
        console.error(err);
    }
    return name;
}


//A partir de l'url d'un château, retourne le prix minimum d'une nuit au château
async function get_castle_price(url){
    var price;
    var options = {
        uri: url,
        method: 'GET',
        transform: function(body){
          return cheerio.load(body);
        }
    }
    try{
      var $ = await request(options);
      price = $('.price').first().text();
      price = price.replace(/,/g, '.');
      price = Number(price);
    }catch(err){
        console.error(err);
    }
    return price;
}


//A partir de l'url d'un château, retourne le nom du château
async function get_castle_name(url){
    var castleName;
    var options = {
        uri: url,
        method: 'GET',
        transform: function(body){
          return cheerio.load(body);
        }
    }
    try{
      var $ = await request(options);
      castleName = $('.mainTitle2').first().text();
      castleName = castleName.replace(/^\s|\s{2}|\s$/g, '');
    }catch(err){
        console.error(err);
    }
    return castleName;
}



async function get_castle_info(url){
    var castleName;
    var urlOngletResto;
    var restoName;
    var price;
    var options = {
        uri: url,
        method: 'GET',
        transform: function(body){
          return cheerio.load(body);
        }
    }
    try{
      var $ = await request(options);

      castleName = $('.mainTitle2').first().text();
      castleName = castleName.replace(/^\s|\s{2}|\s$/g, '');

      urlOngletResto = $('.jsSecondNavMain').children('li').first().next().children('a').attr('href');

      price = $('.price').first().text();
      price = price.replace(/,/g, '.');
      price = Number(price);
    }catch(err){
        console.error(err);
    }


    // Get the name of the first restaurant
    var options = {
        uri: url,
        method: 'GET',
        transform: function(body){
          return cheerio.load(body);
        }
    }
    try{
      var $ = await request(options);
      restoName = $('.hotelTabsHeaderTitle').children('h3').text();
      restoName = restoName.replace(/^\s|\s{2}|\s$/g, '');
    }catch(err){
        console.error(err);
    }

    var infos = [castleName, restoName, price];

    return infos;
}


async function get(){
  console.log('Retrieving castles urls in France...');
  let urls = await get_castle_url();
  console.log('Checking if castles have restaurants...\nWARNING: since this operation takes too much time, I will only check the first 10 castles');
  let filtered = await get_hotelAndRestaurant(urls);
  console.log('Retriving informations of castles...');
  let castles = [];
  for(var i = 0; i < filtered.length; i++){
    /*
    var url = urls[i];
    var castleName = await get_castle_name(url);
    var price = await get_castle_price(url);
    var restoName = await get_restaurant_name(url);
    */
    var url = urls[i];
    var infos = await get_castle_info(urls[i]);
    var castleName = infos[0];
    var restoName = infos[1];
    var price = infos[2];

    var castleString = JSON.stringify({ url: url, castle: castleName, resto: restoName, price: price });
    var castle = JSON.parse(castleString);
    castles.push(castle);
    process.stdout.write("---Processing " + i + "/" + filtered.length + "---\r");
  }
  process.stdout.write("---Processing " + filtered.length + "/" + filtered.length + "---\r");
  console.log('\n\nDONE');
  return castles;
}

exports.get = get;
