'use strict';

module.exports = function(Product) {
  Product.observe('before save', (ctx, next) => {
    if (ctx.instance && ctx.instance.categoryId) {
      return Product.app.models.Category.count({
        id: ctx.instance.categoryId,
      }).then(res => {
        if (res < 1) {
          return Promise.reject(
            'Error adding product to non-existing category'
          );
        }
      });
    }
    return next();
  });

  const validateQuantity = quantity => quantity > 3;

  /**
   * But this product
   * @param {number} quantity Number of products to buy
   * @param {Function(Error, object)} callback
   */
  Product.prototype.buy = function(quantity, callback) {
    if (!validateQuantity(quantity)) {
      return callback(`Invalid quantity ${quantity}`);
    }
    var result = {
      status: `You bought ${quantity} product(s)`,
    };
    callback(null, result);
  };

  Product.validatesLengthOf('name', {
    min: 3,
    message: {
      min: 'Name should be at least 3 characters',
    },
  });

  Product.validatesUniquenessOf('name');

  const positiveInteger = /^[0-9]*$/;
  const validatePositiveInteger = function(err) {
    if (!positiveInteger.test(this.price)) {
      err();
    }
  };
  Product.validate('price', validatePositiveInteger, {
    message: 'Price should be a positive integer',
  });

  function validateMinimumPrice(err, done) {
    const price = this.price;

    process.nextTick(() => {
      const minimalPriceFromDB = 99;
      if (price < minimalPriceFromDB) {
        err();
      }
      done();
    });
  }

  Product.validateAsync('price', validateMinimumPrice, {
    message: 'Price must be higher than the minimal price in the DB',
  });
};
