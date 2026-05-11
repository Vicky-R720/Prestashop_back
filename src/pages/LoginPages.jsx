import { useState } from "react";
import { useNavigate,useLocation } from "react-router-dom";

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";

    const onSubmite = (e) => {
        e.preventDefault();
        // Exemple simple de connexion
        if (email && password) {
            localStorage.setItem("auth", "1");

            navigate(from, { replace: true });
        }
    };

    return (
        <form onSubmit={onSubmite}>
            <input type="text" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit">Se connecter</button>
        </form>
    );
}

export default LoginPage