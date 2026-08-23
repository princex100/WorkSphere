import { Poller_One } from "next/font/google"
import pg, { Pool } from "pg"
 

const checkPool=globalThis as unknown as {
    pool:Pool | undefined
}

const pool=checkPool.pool ?? new  Pool({
    connectionString:process.env.DB_URL
})


export default pool
