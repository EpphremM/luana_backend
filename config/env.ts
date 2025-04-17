import {configDotenv} from 'dotenv'
configDotenv();
const ENV = {
  db_username: process.env.DB_USERNAME,
  db_password: process.env.DB_PASSWORD,
  db_name: process.env.DB_NAME,
  db_port: process.env.DB_PORT,
  express_port: process.env.PORT,
  secrete_key:process.env.SECRETE_KEY,
  chapa_url:process.env.CHAPA_URL,
  jwt_secrete:process.env.JWT_SECRETE_KEY,
  node_env:process.env.NODE_ENV,
  db_host:process.env.DB_HOST,
  return_url:process.env.RETURN_URL,
  callback_url:process.env.CALLBACK_URL
};
export default ENV;

