import { expect } from 'chai';
import sinon from 'sinon';
import dbClient from '../utils/db';

describe('dbClient', () => {
  before(() => {
    sinon.stub(dbClient.client, 'isConnected').returns(true);
    sinon.stub(dbClient.db, 'collection').returns({
      countDocuments: sinon.stub().resolves(5),
    });
  });

  after(() => {
    sinon.restore();
  });

  it('should return true if MongoDB client is alive', () => {
    expect(dbClient.isAlive()).to.be.true;
  });

  it('should return the number of users', async () => {
    const count = await dbClient.nbUsers();
    expect(count).to.equal(5);
  });

  it('should return the number of files', async () => {
    const count = await dbClient.nbFiles();
    expect(count).to.equal(5);
  });
});
