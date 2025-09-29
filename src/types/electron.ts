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