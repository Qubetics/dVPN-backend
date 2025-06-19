const REDIS_ERR_MSG:{CONN_ERR: string} = {
    CONN_ERR :'Redis Connection Error: '
}

const CLIENT_EVENTS = {
    CONNECT: 'Connecting to redis server',
    READY: 'Redis connected',
    ERROR: 'Redis Server Error: ',
    END: 'Redis client disconnected',
    RECONNECTING: 'Reconnecting to redis server',
    BINDING_ERR: 'Error while binding the redis events: '
}

export {
    REDIS_ERR_MSG,
    CLIENT_EVENTS
};