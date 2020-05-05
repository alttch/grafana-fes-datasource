export class FESDatasource {
  constructor(instanceSettings, $q, backendSrv, templateSrv) {
    this.type = instanceSettings.type;
    this.url = instanceSettings.url;
    this.name = instanceSettings.name;
    this.apikey = instanceSettings.jsonData.apikey;
    this.backendSrv = backendSrv;
    this.templateSrv = templateSrv;
    this.basicAuth = instanceSettings.basicAuth;
    this.withCredentials = instanceSettings.withCredentials;
  }

  buildQueryParameters(options) {
    options.targets = _.filter(options.targets, target => {
      return target.target.trim() !== 'SELECT';
    });
    let targets = _.map(options.targets, target => {
      return {
        target: this.templateSrv.replace(
          target.target,
          options.scopedVars,
          'regex'
        ),
        refId: target.refId,
        hide: target.hide,
        type: target.type || 'timeserie'
      };
    });
    options.targets = targets;
    return options;
  }

  query(options) {
    let query = this.buildQueryParameters(options);
    query.targets = query.targets.filter(t => !t.hide);
    let q = [];
    options['targets'].forEach(option => {
      if (option.target) q.push([option.target, option.type === 'timeserie']);
    });
    if (q) {
      return this._fq(q).then(result => {
        result.data.forEach(r => {
          if ('error' in r) {
            throw r['error'];
          }
        });
        return {
          status: 'success',
          data: result.data
        };
      });
    }
  }

  testDatasource() {
    return this.call('get_version')
      .then(result => {
        return {
          status: 'success',
          message: 'Data source is working',
          title: 'Success'
        };
      })
      .catch(err => {
        return {
          status: 'error',
          message: err
        };
      });
  }

  call(q) {
    return this._fq([q]);
  }

  _fq(data) {
    const req = {
      method: 'POST',
      url: `${this.url}/query?time_ms=1`,
      data: data,
      inspect: {type: this.type}
    };
    req.headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    };
    if (this.apikey) {
      req.headers['X-Auth-Key'] = this.apikey;
    }
    if (this.basicAuth || this.withCredentials) {
      req.withCredentials = true;
    }
    if (this.basicAuth) {
      req.headers.Authorization = this.basicAuth;
    }
    return this.backendSrv.datasourceRequest(req).then(
      result => {
        return result;
      },
      err => {
        let msg = 'Server error: ';
        if (err.status == 403) {
          msg += 'Invalid API key';
        } else if (err.status == 401) {
          msg += 'API key not provided';
        } else {
          msg += err.status;
        }
        throw msg;
      }
    );
  }
}
