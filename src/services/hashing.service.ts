import bcrypt from 'bcrypt'
export const hashPassword=async(password:string)=>{
const saltRound=15;
const hashedPassword:string=await bcrypt.hash(password,saltRound);
return hashedPassword;
}

export const verifyPassword = async (password: string, hash: string) => {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      console.error('Password verification error:', error);
      throw new Error('Password verification failed');
    }
  };
  