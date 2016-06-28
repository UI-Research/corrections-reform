# Geographic data for federal prison feature

library(openxlsx)
library(dplyr)
library(tidyr)
library(rgdal)

xldt <- "data/original/Data for interactive feature 5_20_2016.xlsx"


########################################################################################################
# Number of people sentenced by judicial district
########################################################################################################
# Get id element from shapefile to merge with topojson
shp <- readOGR("shp/JudicialDistricts_Final","JudicialDistricts_Final")
# make a unique id field for geo file
shp@data <- shp@data %>% mutate(id = row_number())
writeOGR(shp, dsn="shp/JudicialDistricts_Final", layer="JudicialDistricts_Final", driver="ESRI Shapefile", overwrite_layer = T)

shpdata <- shp@data
shpdata[] <- lapply(shpdata, as.character)
shpdata <- shpdata %>% select(DISTRICT_A, DISTRICT_N, id) %>% 
  rename(name = DISTRICT_N, districtcode = DISTRICT_A)
shpdata$id <- as.numeric(shpdata$id)
  
districtsentences <- readWorkbook(xldt, sheet="Slide 5a (geography 1)", startRow=7, cols=c(1:2), colNames = T)
colnames(districtsentences) <- tolower(colnames(districtsentences))
districtsentences <- districtsentences %>% rename(districtcode = district, sentences = n)
districtsentences <- full_join(districtsentences, shpdata, by="districtcode")

# NOTE - we have sentences for Guam and NMI but they aren't in the shapefile
districtsentences <- districtsentences %>% filter(!is.na(id))
write.csv(districtsentences, "data/districtsentences.csv", row.names=F)

summary(districtsentences$sentences)

########################################################################################################
# Judicial district centroids (calculated from shp in qgis)
########################################################################################################
districtsentences <- read.csv("data/districtsentences.csv", stringsAsFactors = F)

centroids <- readOGR("shp/DistrictCentroids","districtcentroids")
centroids <- centroids@data
centroids <- centroids %>% filter(!is.na(DISTRICT_I)) %>%
	select(DISTRICT_A, lat, long) %>%
	rename(latitude = lat, longitude = long, districtcode = DISTRICT_A)
districtsentences <- left_join(districtsentences, centroids, by="districtcode")
write.csv(districtsentences, "data/districtsentences.csv", row.names=F)

########################################################################################################
# Geographic data
# District where sentenced -> eventual prison
########################################################################################################
# Format facility geographies
facilities <- read.csv("data/facilities.csv", stringsAsFactors = F, colClasses=c("zip" = "character"))
#facilities$facilityzip <- sprintf("%05s", facilities$facilityzip)
#facilities <- facilities %>% rename(name = Facility.name, address = Address, zip = facilityzip, latitude = Lat, longitude = Long) %>% 
#	select(-complex) %>% 
#	arrange(zip)
#write.csv(facilities, "data/facilities.csv", row.names=F)

# We'll collapse by zip code for mapping
zips <- facilities %>% group_by(zip) %>%
	summarize(latitude = mean(latitude), longitude = mean(longitude))

georaw <- read.csv("data/original/dist_zip_faclcsv.csv", colClasses="character")
sentencesbyzip <- georaw %>% group_by(facilityzip) %>% 
	summarize(sentences = n()) %>%
	rename(zip = facilityzip)

# Join number of sentences to zip code
zips <- left_join(zips, sentencesbyzip, by="zip")
write.csv(zips, "data/complexzips.csv", row.names=F)
#georaw <- left_join(georaw, shpdata, by=c("dist" = "districtcode"))

# Number of people sentenced to each zip code by judicial district
# Exclude if n <= 15
zipbydistrict <- georaw %>% group_by(dist, facilityzip) %>% 
  summarize(sentences = n()) %>%
	rename(districtcode = dist, zip = facilityzip) %>%
	filter(sentences >= 15)

zipbydistrict <- left_join(zipbydistrict, zips, by = "zip")

# Join district centroid to data
centroids <- centroids %>% rename(centroid_lat = latitude, centroid_long = longitude)
zipbydistrict <- left_join(zipbydistrict, centroids, by="districtcode")
zipbydistrict <- zipbydistrict %>% rename(zip_lat = latitude, zip_long = longitude)

write.csv(zipbydistrict, "data/zipsbydistrict.csv", row.names=F)