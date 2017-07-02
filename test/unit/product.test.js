'use strict';

const {app, expect} = require('../common');

const Product = app.models.Product;

describe('It should resovle', function() {
  it('a Product.find', function() {
    return Product.find().then(res => console.log(res));
  });
});

describe('Hooks', function() {
  it('should not allow adding a product to non-existing category', function() {
    return Product.create({
      name: 'new category',
      price: 199,
      categoryId: 9999,
    })
    .then(res => expect(res).to.equal(null))
    .catch(err => {
      expect(err).to.equal('Error adding product to non-existing category');
    });
  });
});

describe('Custom', function() {
  it('should allow buying a product', function() {
    const product = new Product({
      name: 'buy-product',
      price: 299,
    });
    return product.buy(10, function(err, res) {
      expect(res.status).to.contain('You bought 10 product(s)');
    });
  });
  it('should not allow buying a negative product quantity', function() {
    const product = new Product({
      name: 'buy-product',
      price: 299,
    });
    return product.buy(-10, function(err, res) {
      expect(err).to.contain('Invalid quantity -10');
    });
  });
  it('should reject a name < 3 chars', function() {
    return Product.create({
      name: 'a',
      price: 200,
    }).then(res => {
      Promise.reject('Product should not be created');
    }).catch(err => {
      expect(err.message).to.contain('Name should be at least 3 characters');
      expect(err.statusCode).to.be.equal(422);
    });
  });
  it('should reject a duplicate name', function() {
    return Promise.resolve().then(() => {
      return Product.create({
        name: 'abc',
        price: 299,
      });
    }).then(() => {
      return Product.create({
        name: 'abc',
        price: 299,
      });
    }).then(res => {
      return Promise.reject('Product should not be created');
    }).catch(err => {
      expect(err.message).to.contain('Details: `name` is not unique');
      expect(err.statusCode).to.be.equal(422);
    });
  });
  it('should reject a price < 0', function() {
    return Product.create({
      name: 'lowPrice',
      price: -1,
    }).then(res => {
      return Promise.reject('Product should not be created');
    }).catch(err => {
      expect(err.message).to.contain('Price should be a positive integer');
      expect(err.statusCode).to.be.equal(422);
    });
  });
  it('should reject a price below the minimum 99', function() {
    return Product.create({
      name: 'lowPrice',
      price: 98,
    }).then(res => {
      return Promise.reject('Product should not be created');
    }).catch(err => {
      expect(err.message).to.contain(
        'Price must be higher than the minimal price'
      );
      expect(err.statusCode).to.be.equal(422);
    });
  });
  it('should store a correct product', function() {
    return Product.create({
      name: 'all good',
      price: 200,
    }).then(res=> {
      expect(res.name).to.equal('all good');
      expect(res.price).to.be.equal(200);
      expect(res.id).to.be.greaterThan(0);
    });
  });
});
