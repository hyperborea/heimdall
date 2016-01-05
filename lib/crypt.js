if (Meteor.isServer) {
  var aes = Meteor.npmRequire('crypto-js/aes');
  var utf8 = Meteor.npmRequire("crypto-js/enc-utf8");

  const salt = Meteor.settings.salt || 'salt';

  if (!Meteor.settings.salt)
    console.warn('WARNING: Heimdall was not provided salt and is using an insecure default value.');

  encryptString = function(str) { return aes.encrypt(str, salt).toString() };
  decryptString = function(str) { return aes.decrypt(str, salt).toString(utf8) };
}