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
# Geographic data
# District where sentenced -> eventual prison
########################################################################################################
georaw <- read.csv("data/original/dist_zip_faclcsv.csv", colClasses="character")
georaw <- left_join(georaw, shpdata, by=c("dist" = "districtcode"))

prisonbydistrict <- as.data.frame(table(georaw$dist, georaw$arsfacl)) %>% 
  rename(dist = Var1, arsfacl = Var2) %>%
  filter(Freq != 0)

zipbydistrict <- georaw %>% group_by(dist, facilityzip) %>% 
  summarize(num = n())