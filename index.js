const express = require('express');
const bodyParser = require('body-parser');
const supabase = require('@supabase/supabase-js');
const md5 = require('md5')
const jwt = require('jsonwebtoken');
const e = require('express');
const cors = require('cors');
const supabaseUrl = 'https://papreleoermenrdcqdvl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhcHJlbGVvZXJtZW5yZGNxZHZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTI2NTcxMzQsImV4cCI6MjAyODIzMzEzNH0.X2LDuVgb3nNlrd2wTOnVdqeaW7BUrEvBFbSDNZEvFSM'
const app = express();
app.use(bodyParser.json());
app.use(cors())
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

app.post('/register', async (req, res) => {


    const { username, password, last_name, first_name, email } = req.body;

    const check = await supabaseClient.from('users').select('*').eq('username', username);

    if (check.data != '') {
        if (username === check.data[0].username) {
            res.status(422)
            res.send('login used')
            return
        }
    }

    const hashedPassword = md5(password);

    const token = jwt.sign({ email: email }, 'SECRET_KEY', { expiresIn: '1h' });


    const { data, error } = await supabaseClient
        .from('users')
        .insert([{ username, password: hashedPassword, last_name, first_name, email, token }]);


    if (error) {
        res.status(500).json({ error: error.message });
    }

    res.json({ data, error });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!req.body.username || !req.body.password) {
        res.status(500)
        res.send('Не указаны данные')
        return
    }

    const { data, error } = await supabaseClient
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', md5(password))
        .single();

    if (error) {
        return res.status(401).json({ error: 'Неверный логин или пароль' });
    }

    const token = jwt.sign({ email: data.email }, 'SECRET_KEY', { expiresIn: '1h' });

    await supabaseClient
        .from('users')
        .update({ token: token })
        .eq('username', username);

    res.json({ token });
});

app.get('/users/:username', async (req, res) => {
    const username = req.params.username;
    try {
        const { data, error } = await supabaseClient.from('users').select('*').eq('username', username);
        if (error) {
            throw error;
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/search', async (req, res) => {
    const { query } = req.query;
  
    try {
      const { data, error } = await supabaseClient
        .from('users')
        .select('*')
        .or( `username.ilike.%${query}%`, `first_name.ilike.%${query}%` , `last_name.ilike.%${query}%`);
  
      if (error) {
        throw error;
      }
  
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

app.post('/test/not', async (req, res) => {


    const { user_id, message , checkMessage} = req.body;



    const { data, error } = await supabaseClient
        .from('notifications')
        .insert([{ user_id , message , checkMessage }]);


    if (error) {
        res.status(500).json({ error: error.message });
    }

    res.json({ data, error });
});

app.post('/dialog', async (req, res) => {
    const { user1_id, user2_id} = req.body;

    // Проверяем, существует ли уже диалог между пользователями
    const { data: existingDialogs, error: dialogError } = await supabaseClient
        .from('dialogs')
        .select('*')
        .eq('user1_id', user1_id)
        .eq('user2_id', user2_id);

    if(dialogError) {
        res.status(500).json({ error: dialogError.message });
        return;
    }

    if(existingDialogs.length > 0) {
        res.status(400).json({ error: 'Диалог между пользователями уже существует' });
        return;
    }

    // Создаем новый диалог, если его еще нет
    const { data, error } = await supabaseClient
        .from('dialogs')
        .insert([{ user1_id , user2_id }]);

    if (error) {
        res.status(500).json({ error: error.message });
        return;
    }

    res.json({ data, error });
});



app.get('/userstoken/:token', async (req, res) => {
    const token = req.params.token;
    try {
        const { data, error } = await supabaseClient.from('users').select('*').eq('token', token);
        if (error) {
            throw error;
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get('/dialog/user/:user_id', async (req, res) => {
    const user_id = req.params.user_id;
    try {
        const { data, error } = await supabaseClient.from('dialogs').select('*').or(`user1_id.eq.${user_id},user2_id.eq.${user_id}`);
        if (error) {
            throw error;
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/users/dialog/:user_id', async (req, res) => {
    const user_id = req.params.user_id;
    try {
        const { data, error } = await supabaseClient.from('users').select('*').eq('user_id', user_id);
        if (error) {
            throw error;
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/message', async (req, res) => {
    var date = new Date();
    const { dialog_id , sender_id , message_text} = req.body;
    const { data, error } = await supabaseClient
        .from('messages')
        .insert([{ dialog_id , sender_id , message_text , timestamp: date }]);
    if (error) {
        res.status(500).json({ error: error.message });
    }
    res.json({ data, error });
})


app.get('/users/message/:dialog_id', async (req, res) => {
    const dialog_id = req.params.dialog_id;
    try {
        const { data, error } = await supabaseClient.from('messages').select('*').eq('dialog_id', dialog_id);
        if (error) {
            throw error;
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/users2/info/:dialog_id', async (req, res) => {
    const dialog_id = req.params.dialog_id;
    try {
        const { data, error } = await supabaseClient.from('dialogs').select('user2_id').eq('dialog_id', dialog_id);
        if (error) {
            throw error;
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});