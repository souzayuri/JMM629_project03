
rm(list = ls()) 

if(!require(tidyverse)) install.packages("tidyverse", dependencies = TRUE)


data <- read_csv("C:/Users/Yuri/Downloads/tapirs_road_kills.csv") |> 
  select(c(10,11)) |> 
  group_by(year) |> 
  summarise(sum = sum(numberOfRoadkill)) |> 
  ungroup()


ggplot(data, aes(x = year, y = sum)) +
  geom_col(color = 'black', fill = 'darkgray') +
  theme_bw() +
  labs(x = "Year", y = "# Individuals", title = "Tapirs killed by roadkill") +
  theme(axis.title = element_text(size = 16),
        axis.text = element_text(size = 16),
        title = element_text(size = 18),
        axis.text.x = element_text(hjust = 1))
