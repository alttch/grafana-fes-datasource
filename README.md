# grafana-fes-datasource

Grafana datasource plugin for [Finac Enterprise
Server](https://www.altertech.com/products/fes/)

(can work with custom [Finac](https://github.com/alttch/finac) servers as well)

![Dashboard](https://raw.githubusercontent.com/alttch/grafana-fes-datasource/master/screenshots/1.png "Dashboard")
![Explore](https://raw.githubusercontent.com/alttch/grafana-fes-datasource/master/screenshots/2.png "Expore")

## Installation

(become a superuser)

```shell
cd /var/lib/grafana/plugins
git clone https://github.com/alttch/grafana-fes-datasource
cd grafana-fes-datasource
npm i
npm run build
systemctl restart grafana-server
```

## Data source configuration

* Create new data source in Grafana, choose FesDS plugin
* Use http(s)://yourservername as server URL (no leading slash, no URIs)
* Enter Finac server API key (if set)

## Usage

### Simple SELECT

The data source supports all Finac query commands, e.g.

```sql
SELECT account_balance(account="myaccount")
```

### Switching base currency on-the-flow

* create Grafana variable, named e.g. *base*, put there EUR,USD,CZK as the
  values.

* then use variable in queries (don't forget about quotes):

```sql
SELECT account_balance(account="myaccount", base="${base}")
```

### Time-based SELECT

Use Grafana global time variables to specify time range, e.g.

```sql
SELECT account_balance_range(account="myaccount", start=${__from}, end=${__to},
step="20a")
```

As time variables are integer numbers, quotes are not required.

Note: it's highly useful to use auto-step for charts.

## Data formats

By default, all Finac queries return table series data. The following query
functions can return timestamps:

* asset_rate
* asset_rate_range
* account_balance
* account_balance range

To change timestamp metric name, run query with "AS" parameter:

```sql
SELECT account_balance_range(start=${__from}, end=${__to}, account="myaccount",
    step="20a") AS myaccount
```

## Troubleshooting

### Range charts are slow

Increase range step (or decrease, if using auto-step)
