# Data for federal prison feature

library(openxlsx)
library(dplyr)
library(tidyr)
library(stringr)
library(jsonlite)

xldt <- "data/original/Data for interactive feature 5_20_2016.xlsx"

########################################################################################################
# Growth in the federal prison pop
########################################################################################################
# Prison pop over time
growth <- readWorkbook(xldt, sheet="Slide 2", startRow=3, colNames = F)
growth <- as.data.frame(t(growth))

colnames(growth) <- c("year", "pop_total")
growth <- growth %>% filter(year != "FY")
growth$year <- as.numeric(as.character(growth$year))
growth$pop_total <- as.numeric(as.character(growth$pop_total))

# May 2016 in Excel converted into womp
growth <- growth %>% mutate(year = ifelse(year==42491, 2016, year))
#write.csv(growth, "data/growth.csv", row.names=F)

# Growth drivers
drivers <- readWorkbook(xldt, sheet="Slide 4", startRow=3, colNames = T)
drivers <- drivers %>% gather(year, admissions, -X1) %>%
  rename(offense = X1)
drivers$year <- as.numeric(drivers$year)
#write.csv(drivers, "data/drivers.csv", row.names=F)

#Admissions vs standing population over time
admissions <- readWorkbook(xldt, sheet="Slide 6", rows=c(34:43), colNames = T, skipEmptyRows = T)
admissions <- admissions %>% gather(year, admissions, -Admissions) %>%
  rename(offense = Admissions)
admissions$year <- str_replace(admissions$year, "FY.", "")

standingpop <- readWorkbook(xldt, sheet="Slide 6", rows=c(45:54), colNames = T, skipEmptyRows = T)
standingpop <- standingpop %>% gather(year, standing, -Stock) %>%
  rename(offense = Stock)
standingpop$year <- str_replace(standingpop$year, "FY.", "")

sentences <- left_join(standingpop, admissions, by=c("year", "offense"))
sentences$year <- as.numeric(sentences$year)
sentences_total <- sentences %>% group_by (year) %>%
  summarize(standing = sum(standing), admissions = sum(admissions)) %>%
  mutate(offense = "Total")
sentences <- rbind(sentences, sentences_total)

# Create "other" cateogry
admissions <- sentences %>% select(-standing) %>% spread(offense, admissions) %>% 
  mutate(Other = Total - Drug - Immigration - Sex - Weapon) %>% 
  gather(offense, admissions, -year)
standing <- sentences %>% select(-admissions) %>% spread(offense, standing) %>% 
  mutate(Other = Total - Drug - Immigration - Sex - Weapon) %>% 
  gather(offense, standing, -year)
sentences <- left_join(admissions, standing, by=c("year", "offense"))

sentences <- sentences %>% filter(offense %in% c("Drug", "Weapon", "Immigration", "Sex", "Other", "Total"))
sentences$offense <- tolower(sentences$offense)
#write.csv(sentences, "data/sentences.csv", row.names=F)
rm(admissions, standingpop)

# Mandatory minimums by offense
mandmins <- readWorkbook(xldt, sheet="Slide 8", rows=c(5:14), cols=c(3,4,6), colNames = F, skipEmptyRows = T)
colnames(mandmins) <- c("offense", "mandmin_0", "mandmin_1")
mandmins <- mandmins %>% mutate(total = mandmin_0 + mandmin_1, mandmin_pct = mandmin_1/total)
#write.csv(mandmins, "data/mandmins.csv", row.names=F)

########################################################################################################
# Expected years served - wonky formatted sheet
########################################################################################################
readTimeServed <- function(columns, offense) {
  dt <- readWorkbook("data/original/time_served_6_3.xlsx", sheet=1, rows=c(1,3,4), cols=columns, colNames = T)
  colnames(dt) <- c("mandmin_convict", "years_served", "years_remaining")
  dt$offense <- offense
  return(dt)
}
ts1 <- readTimeServed(c(1,2,3), "total")
ts2 <- readTimeServed(c(1,5,6), "drug")
ts3 <- readTimeServed(c(1,8,9), "weapon")
# not using immigration
# ts4 <- readTimeServed(c(1,11,12), "immigration")
ts5 <- readTimeServed(c(1,14,15), "sex")

timeserved <- bind_rows(ts1, ts2, ts3, ts5)
timeserved$mandmin_convict[timeserved$mandmin_convict=="Convicted of Offense Carrying Mandatory Minimum"] <- 1
timeserved$mandmin_convict[timeserved$mandmin_convict=="Not Convicted of Offense Carrying Mandatory Minimum"] <- 0

timeserved <- timeserved %>% mutate(years_expected = years_served + years_remaining)
#write.csv(timeserved, "data/expectedyears.csv", row.names=F)

########################################################################################################
# Section 2
########################################################################################################
# Race and ethnicity
race <- readWorkbook(xldt, sheet="Slide 3", rows=c(3:8), colNames = T)
race <- race %>% gather(year, pop_total, -X1) %>%
  rename(race = X1)
race <- race %>% spread(race, pop_total) %>%
  rename(race_asian = `Asian American`, race_black = Black, race_hispanic = Hispanic, race_aian = `Native American`, race_white = White)
race$year <- as.numeric(race$year)
#write.csv(race, "data/raceeth.csv", row.names=F)

# Criminal histories
histories <- readWorkbook(xldt, sheet="Slide 7", rows=c(3, 5:10), colNames = T, skipEmptyRows = T)
colnames(histories)
histories <- histories %>% select(X1, All.offenses, Violent, Property, Drugs, Public.Order, Weapon, Immigration, Sex) %>%
  rename(category = X1, Total = All.offenses)
histories <- histories %>% gather(offense, number, -category) 
histories$offense <- tolower(histories$offense)
histories <- histories %>% mutate(offense = ifelse(offense=="public.order", "public order",
                                                   ifelse(offense=="drugs", "drug", 
                                                          offense)))
#write.csv(histories, "data/criminalhistories.csv", row.names=F)

# Prison security for those convicted of drug offenses
security <- readWorkbook(xldt, sheet="Slide 9", rows=c(6:9), cols=c(1,8), colNames = F, skipEmptyRows = T)
colnames(security) <- c("security", "number")
# Sentence case
security$security <- paste0(toupper(substr(security$security, 1, 1)), tolower(substring(security$security, 2)))

########################################################################################################
# Conclusions
########################################################################################################
jointimpact <- readWorkbook(xldt, sheet="Slide 10", startRow=4, colNames = T)
colnames(jointimpact) <- c("year", "pop_baseline", "pop_jointimpact")
jointimpact$year <- str_replace(jointimpact$year, "FY ", "")
jointimpact$year <- as.numeric(jointimpact$year)
#write.csv(jointimpact, "data/jointimpact.csv", row.names=F)

########################################################################################################
# Geographic data
# District where sentenced -> eventual prison
########################################################################################################
georaw <- read.csv("data/original/dist_zip_faclcsv.csv", colClasses="character")

prisonbydistrict <- as.data.frame(table(georaw$dist, georaw$arsfacl)) %>% rename(dist = Var1, arsfacl = Var2) %>%
  filter(Freq != 0)


########################################################################################################
# JSON for viz instead of a bunch of CSVs
########################################################################################################

growthj <- toJSON(growth)
sentencesj <- toJSON(sentences)
historiesj <- toJSON(histories)
securityj <- toJSON(security)
impactj <- toJSON(jointimpact)

# data for mandatory minimum section
mandminj <- '[{"mm_status": "applied", "share": 0.59, "years": 10.193720, "share_cum": 0.59}, 
{"mm_status": "notapplied", "share":  0.2137228, "years": 5.696282, "share_cum": 0.8037228}, 
{"mm_status": "notapplicable", "share": 0.1962772, "years": 5.696282, "share_cum": 1}]'

dtjson <- paste('{"growth": ', growthj, ', "sentences": ', sentencesj,  ', "mandmin_drug": ', mandminj, ', "histories": ', historiesj, ', "security_drug": ', securityj, ', "jointimpact": ', impactj, "}", sep="")
write(dtjson, "data/data.json")
