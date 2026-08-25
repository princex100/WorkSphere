import pool from "./index";
import path from "path";
import fs from "fs";

async function runMigrations(){

    try {
        
        await pool.query(
            `CREATE TABLE IF NOT EXISTS schema_migrations(
                migration_id SERIAL PRIMARY KEY,
                file_name VARCHAR(255) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );`,
            )

        const migrationfolder=path.join(
            process.cwd(),
            "src/lib/db/migrations"
        )
        
        const files=fs.readdirSync(migrationfolder).sort();

        for(const file of files){

            if(!file.endsWith(".sql")){
                continue;
            }

            const exisitingfiles=await pool.query(
                `SELECT * FROM schema_migrations where file_name=$1`,
                [file]
            )
            if(exisitingfiles.rows.length>0){
                console.log(`Skipping ${file} : Already applied`)
                continue;
            }
             
            const sql=fs.readFileSync(
                path.join(migrationfolder,file),
                "utf-8"
                )

            await pool.query(sql);
            
            await pool.query(
                `INSERT INTO schema_migrations(file_name)
                VALUES
                ($1)`,
                [file]
            )

            console.log(`Applied ${file}`)
        }
       
        console.log("All migrations applied successfully");
        
    } catch (error) {
        
        console.error("Error running migrations",error)
    }
    
}

runMigrations()
.then(()=>{
    console.log("Migration completed successfully");
    process.exit(0);
})
.catch((error)=>{
    console.error("Error running migrations",error);
    process.exit(1);
})
.finally(async()=>{
    await pool.end();
})
