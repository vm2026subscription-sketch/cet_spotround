import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
// @ts-expect-error - JSX file
import App from "./App.jsx";
// @ts-expect-error - JSX file
import { AuthProvider } from "./context/AuthContext.jsx";

export default function AppShell() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{ style: { fontFamily: "inherit" } }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
