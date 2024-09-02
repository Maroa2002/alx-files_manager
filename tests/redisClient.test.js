import { expect } from 'chai';
import sinon from 'sinon';
import redisClient from '../utils/redis';

describe('redisClient', () => {
  before(() => {
    sinon.stub(redisClient.client, 'get').yields(null, 'value');
    sinon.stub(redisClient.client, 'setex').yields(null);
    sinon.stub(redisClient.client, 'del').yields(null);
  });

  after(() => {
    sinon.restore();
  });

  it('should return true if redis client is alive', () => {
    expect(redisClient.isAlive()).to.be.true;
  });

  it('should get a value by key', async () => {
    const value = await redisClient.get('key');
    expect(value).to.equal('value');
  });

  it('should set a key with expiration', async () => {
    const result = await redisClient.set('key', 'value', 3600);
    expect(result).to.be.true;
  });

  it('should delete a key', async () => {
    const result = await redisClient.del('key');
    expect(result).to.be.true;
  });
});
