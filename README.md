Heimdall
=============
Heimdall is a free and open-source data visualization and business monitoring system. It's meant to run on-premise within your company network and leverages your existing databases. Collaboration is at its core, so everything you do can be shared and co-owned.

Core concepts
-------------
* __Sources__ are configured database connections
* __Jobs__ run and cache queries on a _source_ and can be scheduled, have alarms and notification
* __Visualizations__ represent _job_ results through a variety of possible widgets
* __Dashboards__ organize multiple _visualizations_

Features
-------------
* a variety of visualization widgets including
  * line, bar and area charts that can be stacked and combined
  * pie and donut charts
  * sortable tables with configurable column types
  * "big number" widgets
  * world and US maps
* interactive dashboards through query parameterization
* supports PostgreSQL, MySQL, Microsoft SQL Server, Impala, CSV and JSON
* queries can be scheduled to run periodically or are executed automatically after the cache validity expires
* alarms and easy rule system supporting notification through email and Slack
* authentication through passwords, LDAP, Google, Github and / or Facebook
* permission management through groups for sources, jobs and dashboards
* realtime updates of configuration and dashboards

Quick Start
-------------
1. Install Meteor
> curl https://install.meteor.com/ | sh
2. Install dependencies (in directory)
> meteor npm install --production
3. Run server (in directory)
> meteor --settings settings-default.json
4. Login at <http://localhost:3000> with the default user "admin" / "admin"
