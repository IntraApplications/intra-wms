import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import client from '@/_lib/sequelize';

export async function POST(request: Request) {

  try {
    const { username, password } = await request.json();
    console.log(username)
    console.log(password)
    console.log("testing connection")
    await client.connect()
    const result = await client.query('SELECT * FROM employees')
    console.log(result)
  } catch (err) {
    console.log(err)
  }
    /*
    try {
     // await sequelize.authenticate();
      //const user = await User.findOne({ where: { email } });
  
      if () {
        return new Response(JSON.stringify({ message: 'Invalid email or password' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
  
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return new Response(JSON.stringify({ message: 'Invalid email or password' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
  
      const token = jwt.sign({ id: user.id, email: user.email }, 'your-secret-key', {
          expiresIn: '1h',
      });
  
      return new Response(JSON.stringify({ token }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error(error);
      return new Response(JSON.stringify({ message: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });

    }
    */
}