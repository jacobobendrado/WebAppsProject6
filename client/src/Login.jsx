import { useState } from 'react'
import './Login.css'
function Login() {
  const [count, setCount] = useState(0)

  return (
    <>
    <div class="container">
        <div class="login-container-wrapper">
            <div class="logo">
            </div>
            <div class="welcome"><strong>Welcome,</strong> please login</div>

            <form class="login-form" method="post" action="php/login.php">
                <div class="form-group">
                    <input id="login_username" class="form-control" type="username" placeholder="Username" name="username" required></input>
                </div>
                <div class="form-group">
                    <input id="login_password" class="form-control" type="password" placeholder="Password" name="password" required></input>
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