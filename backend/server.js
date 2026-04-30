const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();

/* ✅ leer formularios */
app.use(express.urlencoded({ extended: true }));

/* ✅ servir frontend */
app.use(express.static(path.join(__dirname, '../frontend')));

/* ✅ conexión MySQL */
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: 'admin', 
  database: 'panaderia_dona_ana'
});

db.connect(err => {
  if (err) {
    console.error('❌ Error MySQL:', err);
  } else {
    console.log('✅ Conectado a MySQL');
  }
});

/* ✅ LOGIN */
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.send('Datos incompletos');
  }

  db.query(
    'SELECT * FROM usuarios WHERE email = ? AND estado = 1',
    [email],
    async (err, rows) => {
      if (err) {
        console.error(err);
        return res.send('Error del servidor');
      }

      if (rows.length === 0) {
        return res.send('Credenciales inválidas');
      }

      const usuario = rows[0];

      const passwordOK = await bcrypt.compare(
        password,
        usuario.password_hash
      );

      if (!passwordOK) {
        return res.send('Credenciales inválidas');
      }

      // ✅ Login exitoso → redirigir según rol
      switch (usuario.rol) {
        case 'admin':
          res.redirect('/admin.html');
          break;
        case 'vendedor':
          res.redirect('/vendedor.html');
          break;
        case 'cliente':
          res.redirect('/cliente.html');
          break;
        default:
          res.send('Rol no reconocido');
      }
    }
  );
});

/* ✅ iniciar servidor */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor activo en puerto ${PORT}`);
});
