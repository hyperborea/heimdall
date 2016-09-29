Heimdall
=============
Heimdall is a free and open source data visualization and business monitoring system. It's meant to run on-premise within your company network and runs queries on your existing databases.

Features
-------------
* a variety of configurable visualization widgets including
  * line, bar and area charts that can be stacked and combined
  * pie and donut charts
  * sortable tables with optionally configured column types
  * "big number" widgets
  * world and US maps
* visualizations are organized and shared through dashboards
* interactive dashboards through query parameterization
* supports PostgreSQL, MySQL, Microsoft SQL Server, Impala, CSV and JSON
* queries can be scheduled to run periodically or are executed automatically after the cache validity expires
* alarms and easy rule system supporting notification through email and Slack
* authentication support for passwords, LDAP, Google, Github and Facebook
* authorization using groups for sources, jobs and dashbaords

Quick Start
-------------
1. Install Meteor
> curl https://install.meteor.com/ | sh

2. Install dependencies (in directory)
> meteor npm install --production

3. Run server (in directory)
> meteor --settings settings-default.json
