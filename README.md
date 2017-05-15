# Chronic-Disease-Indicator-a-semantic-web-project
How students of various universities/schools in United States are susceptible to chronic diseases. (Correlating school database with chronic disease database).

TOOLS USED
 	CSV to RDF converter (from the link provided by professor)
 	Apache Jena Fuseki
 	Google Visualization API 
 	JSON (JavaScript Object Notation) {as an intermediate between query result and visualizations}
 	SPARQL Queries (for data manipulation)


3.	Dataset Description 
•	College Score Card: The College Scorecard project is designed to increase transparency, putting the power in the hands of students and families to compare colleges and see how well schools are preparing their students to be successful. This project provides more data than ever before to help students and families compare college costs and outcomes as they weigh the tradeoffs of different colleges, accounting for their own needs and educational goals.
Link : https://catalog.data.gov/dataset/college-scorecard


Number of Triples: 759719
Size: 200 MB
Description: 
UGDS: Number on intakes
STABBR: Abbreviation for state name
Year: The year the data is recorded.

•	U.S. Chronic Disease Indicator (CDI): CDC's Division of Population Health provides cross-cutting set of 124 indicators that were developed by consensus and that allows states and territories and large metropolitan areas to uniformly define, collect, and report chronic disease data that are important to public health practice and available for states, territories and large metropolitan areas. In addition to providing access to state-specific indicator data, the CDI web site serves as a gateway to additional information and data resources.
Link: https://catalog.data.gov/dataset/u-s-chronic-disease-indicators-cdi-e50c9
Number of Triples: 2381078
Description:
Topic: The disease in question
Location: Abbreviation for state name
Year Start: The time of the previous year’s survey that leads to the current year’s survey.
Year End: The ending year of the current survey.

We are majorly interested in the Year End attribute as we need to consider only the consolidated survey results for a particular ongoing year.

4.	Data Integration
The data sets are downloaded from https://catalog.data.gov/dataset/ and over those data sets we use CSV2RDF conversion tool from https://github.com/timrdf/csv2rdf4lod-automation , the result being in a ttl format. Jena Fuseki is used to create a dataset with two named graphs .These two graphs with STABBR and Location as predicate are used to perform SPARQL queries to come up with our target statistics.
