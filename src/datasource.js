export class GenericDatasource {
  constructor(instanceSettings, $q, backendSrv, templateSrv) {
    this.type = instanceSettings.type;
    this.url = instanceSettings.url;
    this.name = instanceSettings.name;
    this.apikey = instanceSettings.jsonData.apikey;
    this.q = $q;
    this.backendSrv = backendSrv;
    this.templateSrv = templateSrv;
    this.withCredentials = instanceSettings.withCredentials;
    if (
      typeof instanceSettings.basicAuth === 'string' &&
      instanceSettings.basicAuth.length > 0
    ) {
      this.headers['Authorization'] = instanceSettings.basicAuth;
    }
  }

  buildQueryParameters(options) {
    //remove placeholder targets
    options.targets = _.filter(options.targets, target => {
      return target.target !== 'select metric';
    });

    var targets = _.map(options.targets, target => {
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
    var query = this.buildQueryParameters(options);
    query.targets = query.targets.filter(t => !t.hide);
    var q = [];
    options['targets'].forEach(option => {
      if (option.target) q.push([option.target, option.type === 'timeserie']);
    });
    if (q) {
      return this.call_query(q).then(result => {
        result.forEach(r => {
          if ('error' in r) {
            throw r['error'];
          }
        });
        return {
          status: 'success',
          data: result
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

  _uuidv4() {
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        var r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16);
      }
    );
    return uuid;
  }

  _prepare_call_params(params) {
    var p = params ? params : {};
    if (this.apikey) {
      p['_k'] = this.apikey;
    }
    return p;
  }

  call_query(q) {
    return new Promise((resolve, reject) => {
      fetch(this.url + '/query?time_ms=1', {
        method: 'POST',
        body: JSON.stringify(q),
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Key': this.apikey
        },
        redirect: 'error'
      })
        .then(function (response) {
          if (response.ok) {
            response
              .json()
              .then(data => {
                resolve(data);
              })
              .catch(err => {
                reject('Invalid server response');
              });
          } else {
            reject(`Server error ${response.status}`);
          }
        })
        .catch(err => {
          reject('Server error');
        });
    });
  }

  call(func, params) {
    var id = this._uuidv4();
    return new Promise((resolve, reject) => {
      var payload = {
        jsonrpc: '2.0',
        method: func,
        params: this._prepare_call_params(params),
        id: id
      };
      fetch(this.url + '/jrpc', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        redirect: 'error',
        body: JSON.stringify(payload)
      })
        .then(function (response) {
          if (response.ok) {
            response
              .json()
              .then(data => {
                if (
                  !'id' in data ||
                  data.id != id ||
                  (!'result' in data && !'error' in data)
                ) {
                  reject('Invalid server response');
                } else if ('error' in data) {
                  reject(data.error.message);
                } else {
                  resolve(data.result);
                }
              })
              .catch(err => {
                reject('Invalid server response');
              });
          } else {
            reject(`Server error ${response.status}`);
          }
        })
        .catch(err => {
          reject('Server error');
        });
    });
  }
}
