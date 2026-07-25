import { BrowserRouter } from "react-router-dom";
// @ts-expect-error - JSX file
import App from "./App.jsx";
// @ts-expect-error - JSX file
import { AuthProvider } from "./context/AuthContext.jsx";

export default function AppShell() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  );
}
