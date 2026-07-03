export interface WritingImage {
  key: string;
  title: string;
  type: 'graph' | 'chart' | 'diagram' | 'table' | 'map';
  description: string;
}

export const WRITING_IMAGES: WritingImage[] = [
  {
    key: 'line-graph-shopping',
    title: 'Online Shopping Growth',
    type: 'graph',
    description: 'A line graph showing the percentage of people who shopped online in four countries (UK, USA, Japan, Brazil) between 2010 and 2023, demonstrating the increase in e-commerce adoption over time.'
  },
  {
    key: 'pie-chart-energy',
    title: 'Energy Consumption by Source',
    type: 'chart',
    description: 'A pie chart illustrating the distribution of energy sources including fossil fuels (45%), renewable energy (30%), nuclear power (15%), and other sources (10%), with comparative data from multiple years.'
  },
  {
    key: 'bar-chart-devices',
    title: 'Mobile Device Usage by Age Group',
    type: 'chart',
    description: 'A grouped bar chart comparing smartphone, tablet, and smartwatch usage percentages across five age groups (13-17, 18-29, 30-45, 46-60, 60+) in 2023.'
  },
  {
    key: 'table-enrollment',
    title: 'University Enrollment Statistics',
    type: 'table',
    description: 'A data table showing student enrollment numbers for five degree programs (Engineering, Business, Medicine, Arts, Sciences) from 2018 to 2023, separated by domestic and international students.'
  },
  {
    key: 'stacked-bar-transport',
    title: 'Public Transportation Usage in City Centers',
    type: 'chart',
    description: 'A stacked bar chart showing the proportion of commuters using different transportation modes (buses, trains, bicycles, cars, walking) in five major cities (London, Tokyo, New York, Singapore, Amsterdam).'
  },
  {
    key: 'pyramid-population',
    title: 'Population Age Distribution',
    type: 'diagram',
    description: 'Two side-by-side population pyramids comparing age and gender distribution in a developed country (with aging population) and a developing country (with younger population), showing structural differences.'
  }
];
