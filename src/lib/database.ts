import mysql from 'mysql2/promise'

// Configuración de la conexión a la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mvc_servir',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}

// Crear el pool de conexiones
export const pool = mysql.createPool(dbConfig)

// Función para verificar la conexión a la base de datos
export async function testDatabaseConnection() {
  try {
    const connection = await pool.getConnection()
    await connection.ping()
    connection.release()
    console.log('✅ Conexión a MySQL establecida correctamente')
    return true
  } catch (error) {
    console.error('❌ Error al conectar con MySQL:', error)
    return false
  }
}

// Función para cerrar el pool de conexiones
export async function closeDatabasePool() {
  try {
    await pool.end()
    console.log('🔌 Pool de conexiones MySQL cerrado')
  } catch (error) {
    console.error('❌ Error al cerrar el pool:', error)
  }
}

// Función helper para ejecutar consultas SELECT
export async function executeQuery(query: string, params: any[] = []): Promise<any[]> {
  try {
    const [rows] = await pool.execute(query, params)
    return rows as any[]
  } catch (error) {
    console.error('❌ Error ejecutando consulta:', error)
    throw error
  }
}

// Función helper para ejecutar consultas INSERT/UPDATE/DELETE
export async function executeUpdate(query: string, params: any[] = []): Promise<any> {
  try {
    const [result] = await pool.execute(query, params)
    return result as any
  } catch (error) {
    console.error('❌ Error ejecutando actualización:', error)
    throw error
  }
}

