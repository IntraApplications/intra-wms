

import pg from 'pg'
const { Client } = pg

type Config = {
    user?: string, // default process.env.PGUSER || process.env.USER
    password?: string, //default process.env.PGPASSWORD
    host?: string, // default process.env.PGHOST
    port?: string, // default process.env.PGPORT
    database?: string, // default process.env.PGDATABASE || user
    connectionString?: string, // e.g. postgres://user:password@host:5432/database
    ssl?: any, // passed directly to node.TLSSocket, supports all tls.connect options
    types?: any, // custom type parsers
    statement_timeout?: number, // number of milliseconds before a statement in query will time out, default is no timeout
    query_timeout?: number, // number of milliseconds before a query call will timeout, default is no timeout
    lock_timeout?: number, // number of milliseconds a query is allowed to be en lock state before it's cancelled due to lock timeout
    application_name?: string, // The name of the application that created this Client instance
    connectionTimeoutMillis?: number, // number of milliseconds to wait for connection, default is no timeout
    idle_in_transaction_session_timeout?: number // number of milliseconds before terminating any session with an open idle transaction, default is no timeout
}


const client = new Client({
  
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT!),
  database: process.env.DB_NAME,
  
 // connectionString: 'postgresql://kendall:0920@localhost:5432/kendall'
});

//

export default client