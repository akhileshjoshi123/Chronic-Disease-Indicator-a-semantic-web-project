// Helper functions

function converToArray(data, types) {
    var result = []
    $.each(data.results.bindings, function(idx, binding) {
       var record = [];
       $.each(data.head.vars, function(idx, col) {
          var value = binding[col].value
          if(types[idx] === 'string')
             value = value.toString()
          else if(types[idx] === 'number') 
             value = Number(value)
          record.push(value)
      });
      result.push(record);
    });
    return result;
}    


function runSparqlQuery(query, headers, types) {
  var records = [];
  var url = "http://localhost:3030/semantic_project/query";
  $.ajax({
     type: "POST",
     url: url,
     async: false,    
     success: function(data) {
        records = converToArray(data, types);
     },
     data: {
        'query': query
  }});

  var result = new google.visualization.DataTable();
  $.each(headers, function(idx, val){
    result.addColumn(types[idx], headers[idx]);
  });
  result.addRows(records);
  return result;
}


function drawGeoMap(query, headers, types, docId, callback=null, options=null) {
  data = runSparqlQuery(query, headers, types);
  var options = options || {region: "US", resolution: "provinces"};
  var chart = new google.visualization.GeoChart(document.getElementById(docId));
  chart.draw(data, options);
  
  //add selection listener to geochart
  if(callback != null)
    google.visualization.events.addListener(chart, 'regionClick', callback);
}

function escapeHTML(htmlString) { 
  return $("<div>").text(htmlString).html();
}

// End of helper functions

// Graph functions

function firstgraph() {
  var query = ' PREFIX team:<http://utdallas.edu/incognito#/source/home/dataset/sandy/vocab/raw/> \n'
              + ' PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> \n'
              + ' select  ?p ( sum(xsd:integer(?cnt)) as ?c ) \n'
              + ' where{ \n'
              + '   graph ?graph_college{ \n'
              + '      ?s team:stabbr ?p . \n'
              + '      ?s team:ugds ?cnt . \n'
              + '      FILTER NOT EXISTS { \n'
              + '         ?s team:ugds "NULL" \n'
              + '      } \n'
              + '   } \n'
              + ' } \n'
              + ' group by ?p \n';

  $('#graph-header').text('Chart Depicting Student Intake');
  $('#sparql-query').text(query);
  var options = {colorAxis: {colors: ['#ebf0fa', '#2e5cb8', 'blue']}, datalessRegionColor:"#DEDEDE", region: "US", resolution: "provinces"};
  drawGeoMap(query.replace('\n', ''), ['State', 'Count'], ['string', 'number'], 'primary-graph', firstgraphbar, options);

}

function firstgraphbar(e) {
  var state = e.region.split("-")[1];
  var query = ' PREFIX team:<http://utdallas.edu/incognito#/source/home/dataset/sandy/vocab/raw/> '
              + ' PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> '
              + ' select ?year ( sum(xsd:integer(?cnt)) as ?intake ) '
              + ' where{ '
              + '   graph ?graph_college{ '
              + '      ?s team:stabbr ?p . '
              + '      ?s team:ugds ?cnt . '
              + '      ?s team:year ?year . '
              + '      FILTER (regex(str(?p), "' +state + '")) '
              + '      FILTER NOT EXISTS { '
              + '         ?s team:ugds "NULL" '
              + '      } '
              + '   } '
              + ' } '
              + ' group by ?year '
              + ' order by ?year '

  var headers = ['year', 'intake']
  var types = ['string', 'number']
  var data = runSparqlQuery(query, headers, types)

  var options = { 
     title: 'Intake by year in ' +state,
     hAxis: {title: 'Intake'},
     vAxis: {title: 'Year'},
     legend: 'none'
  };

  var chart = new google.visualization.BarChart(document.getElementById('secondary-graph'));
  chart.draw(data, options);
}

function secondgraph() {
  var query = ' PREFIX team:<http://utdallas.edu/incognito#/source/home/dataset/sandy/vocab/raw/> \n'
              + ' SELECT ?l (count(?t) as ?a) \n'
              + ' WHERE { \n'
              + '      graph ?graph_chronic { \n'
              + '         ?s team:locationabbr ?l . \n'
              + '         ?s team:topic ?t . \n'
              + '         ?s team:yearend ?y. \n'
              + '   } \n'
              + ' } \n'
              + ' group by ?l \n';
  $('#graph-header').text('Chart Depicting Disease Distribution');
  $('#sparql-query').text(query);
  var options = {colorAxis: {colors: ['#ffe6e6', '#ff8080', '#ff3333']}, datalessRegionColor:"#DEDEDE", region: "US", resolution: "provinces"};
  drawGeoMap(query, ['State', 'Count'], ['string', 'number'], 'primary-graph', secondgraphpie, options);
}

function secondgraphpie(e) {
  var state = e.region.split("-")[1];
  var query = ' PREFIX team:<http://utdallas.edu/incognito#/source/home/dataset/sandy/vocab/raw/> '
              + ' SELECT ?t (count(?t) as ?a) '
              + ' WHERE { '
              + '      graph ?graph_chronic { '
              + '         ?s team:locationabbr ?l . '
              + '         ?s team:topic ?t . '
              + '         ?s team:yearend ?y. '
              + '         FILTER(regex(str(?l), "' +state +'")) '
              + '   } '
              + ' } '
              + ' group by ?t '
              + ' order by desc(?a)'
  var headers = ['disease', 'count']
  var types = ['string', 'number']
  var data = runSparqlQuery(query, headers, types)
     
  var options = {
     title:'Breakdown for '+ state,
     pieSliceText: 'label'
  };

  var chart = new google.visualization.PieChart(document.getElementById('secondary-graph'));

  chart.draw(data, options);
}

function thirdgraph() {
  var query = ' PREFIX team:<http://utdallas.edu/incognito#/source/home/dataset/sandy/vocab/raw/> \n'
              + ' PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> \n'
              + '  \n'
              + ' SELECT distinct ?disease_location (((xsd:float(?disease_count)/xsd:float(?student_count)) * 100) as ?result) \n'
              + ' WHERE { \n'
              + '     { \n'
              + '         SELECT ?disease_location (count(?topic) as ?disease_count) \n'
              + '         WHERE { \n'
              + '             graph ?graph_chronic { \n'
              + '                 ?x team:locationabbr ?disease_location . \n'
              + '                 ?x team:topic ?topic . \n'
              + '             } \n'
              + '         } \n'
              + '         group by ?disease_location \n'
              + '     } \n'
              + '     { \n'
              + '         SELECT ?col_location (sum(xsd:integer(?cnt)) as ?student_count) \n'
              + '         WHERE { \n'
              + '             graph ?graph_college { \n'
              + '                 ?y team:stabbr ?col_location . \n'
              + '                 ?y team:ugds ?cnt . \n'
              + '                 FILTER NOT EXISTS  { \n'
              + '                     ?y team:ugds "NULL" \n'
              + '                 } \n'
              + '             } \n'
              + '         } \n'
              + '         group by ?col_location \n'
              + '     } \n'
              + '      FILTER (?col_location = ?disease_location) \n'
              + ' } \n';

  $('#graph-header').text('Chart Depicting Percentage of Affected Students');
  $('#sparql-query').text(query);
  drawGeoMap(query, ['State', 'Percentage'], ['string', 'number'], 'primary-graph', thirdgraphbar);
}

function thirdgraphbar(e) {

}


// End of Graph function

// Page functions

// scroll function
function scrollToID(id, speed){
var offSet = 50;
var targetOffset = $(id).offset().top - offSet;
var mainNav = $('#main-nav');
$('html,body').animate({scrollTop:targetOffset}, speed);
if (mainNav.hasClass("open")) {
  mainNav.css("height", "1px").removeClass("in").addClass("collapse");
  mainNav.removeClass("open");
}
}
if (typeof console === "undefined") {
   console = {
       log: function() { }
   };
}

// End of Page functions