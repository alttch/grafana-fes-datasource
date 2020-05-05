import {FESDatasource} from './datasource';
import {FESDatasourceQueryCtrl} from './query_ctrl';

class FESConfigCtrl {}
FESConfigCtrl.templateUrl = 'partials/config.html';

class FESQueryOptionsCtrl {}
FESQueryOptionsCtrl.templateUrl = 'partials/query.options.html';

export {
  FESDatasource as Datasource,
  FESDatasourceQueryCtrl as QueryCtrl,
  FESConfigCtrl as ConfigCtrl,
  FESQueryOptionsCtrl as QueryOptionsCtrl,
};
