/*global describe, beforeEach, it*/
'use strict';

describe('co-hapi generator', function () {
  it('can be imported without blowing up', function () {
    require('../app');
    require('../add-plugin');
    require('../remove-plugin');
    require('../mongoose');
    require('../posto');
    require('../auth');
  });
});
