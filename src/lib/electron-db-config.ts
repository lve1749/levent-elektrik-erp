export interface DBConfig {
  server: string;
  database: string;
  user?: string;
  password?: string;
  port?: number;
  trustServerCertificate?: boolean;
  encrypt?: boolean;
  integratedSecurity?: boolean;
}

export function buildConnectionString(config: DBConfig): string {
  let connectionString = `sqlserver://${config.server}`;
  
  // Port ekle
  if (config.port) {
    connectionString += `:${config.port}`;
  } else {
    connectionString += ':1433'; // Default SQL Server port
  }
  
  // Database ekle
  connectionString += `;database=${config.database}`;
  
  // Authentication
  if (config.integratedSecurity) {
    connectionString += `;integratedSecurity=true`;
  } else if (config.user && config.password) {
    connectionString += `;user=${config.user};password=${config.password}`;
  }
  
  // Security options
  if (config.trustServerCertificate !== undefined) {
    connectionString += `;trustServerCertificate=${config.trustServerCertificate}`;
  }
  
  if (config.encrypt !== undefined) {
    connectionString += `;encrypt=${config.encrypt}`;
  }
  
  return connectionString;
}