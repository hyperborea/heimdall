if (Meteor.isServer) {
  const salt = Meteor.settings.salt || 'salt';

  if (!Meteor.settings.salt)
    console.warn('WARNING: Heimdall was not provided salt and is using an insecure default value.');

  encryptString = function(str) {
    var aes = require('crypto-js/aes');
    return aes.encrypt(str, salt).toString();
  };

  decryptString = function(str) {
    var aes = require('crypto-js/aes');
    var utf8 = require('crypto-js/enc-utf8');
    return aes.decrypt(str, salt).toString(utf8);
  };
}