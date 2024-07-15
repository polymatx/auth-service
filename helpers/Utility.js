const uuid = require('uuid');

function generateUniqueId()
{
    return uuid.v4().replace(/-/g, '');
}

function detectLoginType(identity) {
    if ( identity.includes('@') )
    {
        return 'email';
    }

    if ( /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im.test(identity) )
    {
        return 'mobile';
    }

    return 'username';
}

module.exports = { generateUniqueId, detectLoginType };