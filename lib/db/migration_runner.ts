import pool from "./index";
import fs from "fs";
import path from "path";

export async function runMigrations(){

    const migrationFolder=path.join(
       process.cwd(),
       "lib/db/migrations",
        
    )

    const files=fs.readdirSync(migrationFolder).sort()

    for(const file of files){

        if(!file.endsWith('.sql'))continue;


        const sql=fs.readFileSync(
            path.join(migrationFolder,file),
            "utf-8"
        )
    

        await pool.query(sql)



    }

       
console.log("migration ran");

await pool.end()

}

runMigrations()
.then(()=>{
    console.log("all migrations ran")
})

.catch((error)=>{
    console.log(error)
    process.exit(1)
})

