import mysql from 'mysql2/promise';
export function connectDatabase(env=process.env) {
  for(const key of ['DB_NAME','DB_USER','DB_PASSWORD']) if(!env[key]) throw new Error(`${key} must be configured on Hostinger`);
  return mysql.createPool({host:'127.0.0.1',port:Number(env.DB_PORT||3306),database:env.DB_NAME,user:env.DB_USER,password:env.DB_PASSWORD,connectionLimit:5,charset:'utf8mb4',timezone:'Z',multipleStatements:false});
}
export async function schema(db) {
  for(const sql of [
    `CREATE TABLE IF NOT EXISTS mm_editors (email VARCHAR(254) PRIMARY KEY, user_id VARCHAR(64) NOT NULL UNIQUE, active BOOLEAN NOT NULL DEFAULT TRUE)`,
    `CREATE TABLE IF NOT EXISTS mm_content (slug VARCHAR(32) PRIMARY KEY, content JSON NOT NULL, revision INT NOT NULL, updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS mm_content_history (id BIGINT AUTO_INCREMENT PRIMARY KEY, content JSON NOT NULL, revision INT NOT NULL UNIQUE, editor VARCHAR(254) NOT NULL, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS mm_login (token_hash CHAR(64) PRIMARY KEY, email VARCHAR(254) NOT NULL, expires_at DATETIME NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS mm_sessions (token_hash CHAR(64) PRIMARY KEY, csrf CHAR(64) NOT NULL, email VARCHAR(254) NOT NULL, expires_at DATETIME NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS mm_rates (bucket CHAR(64) PRIMARY KEY, hits INT NOT NULL DEFAULT 1, expires_at DATETIME NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS mm_passwords (email VARCHAR(254) PRIMARY KEY, password_hash VARCHAR(200) NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS mm_password_setup (token_hash CHAR(64) PRIMARY KEY, email VARCHAR(254) NOT NULL, expires_at DATETIME NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS mm_setup_provisioned (token_hash CHAR(64) PRIMARY KEY)`,
    `CREATE TABLE IF NOT EXISTS mm_reviews (id BIGINT AUTO_INCREMENT PRIMARY KEY, display_name VARCHAR(40) NOT NULL, review_text TEXT NOT NULL, visitor_hash CHAR(64) NOT NULL, content_hash CHAR(64) NOT NULL, status VARCHAR(16) NOT NULL DEFAULT 'published', created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, moderated_by VARCHAR(254) NULL, moderated_at DATETIME NULL, INDEX reviews_public(status,id), INDEX reviews_author(visitor_hash,content_hash))`,
    `CREATE TABLE IF NOT EXISTS mm_review_forms (token_hash CHAR(64) PRIMARY KEY, visitor_hash CHAR(64) NOT NULL, review_id BIGINT NULL, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, expires_at DATETIME NOT NULL, INDEX review_forms_expiry(expires_at))`,
  ]) await db.execute(sql);
}
export function parseContent(row) {return typeof row.content==='string'?JSON.parse(row.content):row.content;}
