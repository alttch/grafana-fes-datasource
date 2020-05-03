# grafana-fes-datasource

Grafana datasource for [Finac Enterprise Server](https://www.altertech.com/products/fes/)

(can work with custom [Finac](https://github.com/alttch/finac) servers as well)

## Installation

(become a superuser)

```
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

```
SELECT account_balance(account='myaccount')
```

### Switching base currency on-the-flow

* create Grafana variable, named e.g. *base*, put there EUR,USD,CZK as the
  values.

* then use variable in queries (don't forget about quotes):

```
SELECT account_balance(account='myaccount', base="${base}")
```

### Time-based SELECT

Use Grafana global time variables to specify time range, e.g.

```
SELECT account_balance_range(account='myaccount', start=${__from}, end=${__to})
```

As time variables are integer numbers, quotes are not required.

## Troubleshooting

### Range charts are slow

Increase range step, e.g.:

```
SELECT account_balance_range(account='myaccount', start=${__from}, end=${__to}, step=7)
```
