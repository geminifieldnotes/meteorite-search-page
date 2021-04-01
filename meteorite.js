'use strict';

/****************
 * Retrieves the collection of meteorite landings in the NASA Meteorite Landings Dataset associated with a specific meteorite name 
 * and display it within an HTML table element.
 ****************/
function meteorite_fetch(event) {
  event.preventDefault();

  // Get user input value
  const name = document.getElementById('name').value;
  const choice = check_meteorite_class_filter();
  let table_desc = document.getElementById('table-description');
  let query_fragment = "";

  // Modify table desciprion 
  if(choice == null || choice == 'All' && name !== ''){
     query_fragment = `$where=name LIKE '%${name}%' AND mass IS NOT NULL`;
     table_desc.innerHTML = `Known Meteorites with Names Like '${name}'`;
  } else {
     query_fragment = `$where=name LIKE '%${name}%' AND mass IS NOT NULL AND recclass LIKE '%${choice}%'`;
     table_desc.innerHTML = `Known ${choice} Meteorites with Names Like '${name}'`;
  }

  const apiUrl = 'https://data.nasa.gov/resource/gh4g-9sfh.json?' +
                query_fragment +
                '&$order=mass DESC' + 
                '&$limit=50';
  const encodedURL = encodeURI(apiUrl);

  fetch(encodedURL)
    .then(function(response) { // Convert returned JSON String into Array of data.
      return response.json();
    })
    .then(function(meteorites) { // Add array of retrieved data to the table.
      if(meteorites.length > 0 && name !== ''){
        add_meteorites_table(meteorites);
      } else {
        reset_search();
        var error = name=='' || choice=='All' || choice==null ? `No recorded meteorite landings`: `No recorded ${choice} meteorite landings with names like '${name}'`;;
        table_desc.innerHTML = error;
      }
    });
}

/****************
 * Populates table with 10 highest mass in the dataset while user has
 * no input or filter applied.
 ****************/
function default_populate() {
  // Set default table desctiption
  let table_desc = document.getElementById('table-description');
  table_desc.innerHTML = "The Top 10 Densest Known Meteorites";

  // SoQL for dataset
  const apiUrl = 'https://data.nasa.gov/resource/gh4g-9sfh.json?' +
                '$where=mass IS NOT NULL' +
                '&$order=mass DESC' +
                '&$limit=10';

  const encodedURL = encodeURI(apiUrl);

  console.log(encodedURL);

  fetch(encodedURL)
    .then(function(response) { // Convert returned JSON String into Array of trees.
      return response.json();
    })
    .then(function(meteorites) { // Add array of retrieved trees to the table.
      add_meteorites_table(meteorites);
    });
}


/****************
* Gets the parameter and inserts it to the table, clears table, and calls the add_rows function to populate
* the table with data based on user input
****************/
function add_meteorites_table(meteorites) {
  let meteorite_table = document.querySelector('.meteorites tbody');
  meteorite_table.innerHTML = '';
  // For every data in meteorites table insert 
  for (let meteorite of meteorites) {
    add_rows(meteorite_table, meteorite);
  }
}

/**************** 
 * Adds each object from the dataset into the table as rows
 ****************/
function add_rows(table, row){
  const table_row = document.createElement('tr');
  const meteorite_name = document.createElement('td');
  const composition = document.createElement('td');
  const mass = document.createElement('td');
  const status = document.createElement('td');
  const geolocation = document.createElement('td');

  meteorite_name.innerHTML = row.name;
  composition.innerHTML = row.recclass;
  mass.innerHTML = parseFloat(row.mass).toFixed(2);
  status.innerHTML = row.fall; 

  if (row.hasOwnProperty('geolocation')){
    let latitudeValue = row.geolocation.latitude;
    let longitudeValue = row.geolocation.longitude;
    geolocation.innerHTML = `(${latitudeValue}, ${longitudeValue})`;
  } else if (!row.hasOwnProperty('geolocation')) {
    geolocation.innerHTML = 'unknown';
  }

  table_row.appendChild(meteorite_name);
  table_row.appendChild(composition);
  table_row.appendChild(mass);
  table_row.appendChild(status);
  table_row.appendChild(geolocation);

  table.appendChild(table_row);
}


/**************** 
 * Clears search bar and radio buttons
 ****************/
function reset_search() {
  console.log("RESET WAS MADE OvO");
  //Clear input value
  document.getElementById('name').value = null;
  
  // Empty table contents
  let meteorite_table = document.querySelector('.meteorites tbody');
  meteorite_table.innerHTML = '';

  const radios = document.getElementsByName('meteorite_class');
  let i;

  for(i=0; i<radios.length; i++){
    radios[i].checked = false;
  }
}

/****************
 * Checks user's radio button selection and returns value of checked option
 ****************/
function check_meteorite_class_filter(){
  var radios = document.querySelectorAll('input[type="radio"]:checked');
  var value = radios.length>0? radios[0].value: null;

  return value;
}


function bindEventListeners() {
  reset_search();
  // Display top 10 heaviest meteorites until a submit is done
  default_populate();

  const formElement = document.querySelector('form');
  formElement.addEventListener('submit', meteorite_fetch);
}

bindEventListeners();