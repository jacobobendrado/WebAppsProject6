import { useState } from 'react'
import axios from 'axios'

import {Helmet} from "react-helmet";
function Login() {
    const [count, setCount] = useState(0)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    function handleSubmit(event){
        event.preventDefault();
        axios.post('http://localhost:8081/login', {username, password})
        .then(res => console.log(res))
        .catch(err=> console.log(err));
    }
    return (
        <>
        <Helmet>
            <link href="/Users/alexbluesteele/Documents/WebappsProject6/WebAppsProject6/client/src/Login.css" rel="stylesheet" type="text/css" />
        </Helmet>
        <div class="container">
            <div class="login-container-wrapper">
                <div class="logo">
                </div>
                <div class="welcome"><strong>Welcome,</strong> please login</div>

                <form class="login-form" onSubmit={handleSubmit}>
                    <div class="form-group">
                        <input id="login_username" class="form-control" type="username" placeholder="Username" name="username" required onChange={e => setUsername(e.target.value)}/>
                    </div>
                    <div class="form-group">
                        <input id="login_password" class="form-control" type="password" placeholder="Password" name="password" required onChange={e => setPassword(e.target.value)}/>
                    </div>
                    <div class="form-group">
                        <button type="submit" class="btn">Login</button>
                    </div>
                </form>
            </div>
        </div>
        </>
    )
}

export default Login