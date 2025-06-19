const envType = {
    development: 'development',
};

const morganMiddlewareParam =
    ':method :url :status :res[content-length] - :response-time ms';

const socketSuccess = 'Socket connected successfully';

const connections = {
    disconnected: 'disconnected',
    connected: 'connected',
    connecting: 'connecting',
    connection: 'connection',
    error: 'error',
    connection_error: 'Unable to connect postgres'
 };
export {
    envType,
    morganMiddlewareParam,
    socketSuccess,
    connections
};