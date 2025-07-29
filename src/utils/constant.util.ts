const envType = {
    development: 'development',
};

const morganMiddlewareParam =
    ':method :url :status :res[content-length] - :response-time ms';

const connections = {
    disconnected: 'DB disconnected',
    connected: 'DB connected',
    connecting: 'DB connecting',
    connection: 'DB connection',
    error: 'DB error',
    connection_error: 'Unable to connect postgres'
 };
export {
    envType,
    morganMiddlewareParam,
    connections
};