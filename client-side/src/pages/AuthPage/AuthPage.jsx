import { useState } from "react";
import LoginForm from "../Login/LoginForm";
import RegisterForm from "../Register/RegisterForm";
import registrationPhoto from "../../assets/RegistrationPhoto.jpeg";
import "./AuthPage.css";

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="neon-frame">
          <img 
            src={registrationPhoto} 
            alt="Neon Theme" 
            className="auth-image"
          />
          <div className="neon-glow"></div>
          <div className="neon-text">
            <p>WELCOME TO MediaX</p>
          </div>
        </div>
      </div>
      
      <div className="auth-right">
        <div className="auth-form-container">
          {isLogin ? (
            <LoginForm onSwitch={() => setIsLogin(false)} />
          ) : (
            <RegisterForm onSwitch={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;