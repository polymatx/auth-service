const crypto = require( 'crypto' );
const ENCRYPTION_KEY = global._.config.security.databaseEncryptionSecret;

/**
 * Encrypts text by given key
 * @param String text to encrypt
 * @returns String encrypted text, base64 encoded
 */
function encrypt( text )
{
    const iv = crypto.randomBytes( 16 );

    const salt = crypto.randomBytes( 64 );

    const key = crypto.pbkdf2Sync( ENCRYPTION_KEY, salt, 2145, 32, 'sha512' );

    const cipher = crypto.createCipheriv( 'aes-256-gcm', key, iv );

    const encrypted = Buffer.concat( [ cipher.update( text, 'utf8' ), cipher.final() ] );

    const tag = cipher.getAuthTag();

    return Buffer.concat( [ salt, iv, tag, encrypted ] ).toString( 'base64' );
}

/**
 * Decrypts text by given key
 * @param String base64 encoded input data
 * @returns String decrypted (original) text
 */
function decrypt( encdata )
{
    const bData = Buffer.from( encdata, 'base64' );

    const salt = bData.slice( 0, 64 );
    const iv = bData.slice( 64, 80 );
    const tag = bData.slice( 80, 96 );
    const text = bData.slice( 96 );

    const key = crypto.pbkdf2Sync( ENCRYPTION_KEY, salt, 2145, 32, 'sha512' );

    const decipher = crypto.createDecipheriv( 'aes-256-gcm', key, iv );
    decipher.setAuthTag( tag );

    const decrypted = decipher.update( text, 'binary', 'utf8' ) + decipher.final( 'utf8' );

    return decrypted;
}

module.exports = { encrypt, decrypt };
