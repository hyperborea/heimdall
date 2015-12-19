if (Meteor.isServer) {
  var aes = Meteor.npmRequire('crypto-js/aes');
  var utf8 = Meteor.npmRequire("crypto-js/enc-utf8");

  const salt = Meteor.settings.salt || 'salt';

  if (!Meteor.settings.salt)
    console.warn('Heimdall was not provided a salt and is using an insecure default value.');

  encryptString = function(str) { return aes.encrypt(str, salt).toString() };
  decryptString = function(str) { return aes.decrypt(str, salt).toString(utf8) };
}