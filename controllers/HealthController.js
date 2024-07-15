function health( req, res )
{
    res.status( 200 ).send( { result: 'ok' } );
}

module.exports = {
    health
};
