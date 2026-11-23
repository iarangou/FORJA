// Bootstrap seguro y de uso único para la primera cuenta administrativa.
// Uso: ejecutar dentro de backend con variables DB_* y ADMIN_*
// requeridas. NO guardar contraseñas en archivos versionados.
import pg from "pg";
import bcrypt from "bcrypt";

const required = [
  "DB_HOST","DB_USER","DB_PASSWORD","DB_NAME",
  "ADMIN_USERNAME","ADMIN_EMAIL","ADMIN_PASSWORD",
];
const missing = required.filter(name => !process.env[name]);
if(missing.length){
  console.error("Faltan variables de entorno:",missing.join(", "));
  process.exitCode=1;
}else if((process.env.ADMIN_PASSWORD ?? "").length < 12){
  console.error("ADMIN_PASSWORD debe tener al menos 12 caracteres");
  process.exitCode=1;
}else{
  const pool=new pg.Pool({
    host:process.env.DB_HOST,
    port:Number(process.env.DB_PORT ?? "5432"),
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_NAME,
  });
  try{
    const {rows}=await pool.query("SELECT id FROM users WHERE rol_id=(SELECT id FROM rol WHERE name='admin') LIMIT 1");
    if(rows.length){
      console.log("Ya existe al menos un administrador. No se ha creado otra cuenta.");
    }else{
      const passwordHash=await bcrypt.hash(process.env.ADMIN_PASSWORD,12);
      const {rows:admins}=await pool.query(
        `INSERT INTO users(username,email,full_name,rol_id,password_hash,is_active)
         VALUES($1,$2,$3,(SELECT id FROM rol WHERE name='admin'),$4,TRUE)
         RETURNING id,username`,
        [
          process.env.ADMIN_USERNAME.trim(),
          process.env.ADMIN_EMAIL.trim().toLowerCase(),
          "Administrador FORJA",
          passwordHash,
        ],
      );
      console.log("Administrador creado:",admins[0].username);
    }
  }catch(error){
    console.error("No se pudo crear el administrador:",error instanceof Error?error.message:"Error desconocido");
    process.exitCode=1;
  }finally{
    await pool.end();
  }
}
