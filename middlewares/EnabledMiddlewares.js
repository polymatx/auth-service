module.exports = [
    {
        name: 'RateLimiter',
        enabled: true,
        condition: typeof process.env.pm_id !== 'undefined'
    }
];
