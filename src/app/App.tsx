import { BrowserRouter } from "react-router-dom";
import Providers from "./providers";
import AppRouter from "./router";
import AuthInitializer from "../features/auth/components/AuthInitializer";

const App = () => {
  return (
    <Providers>
      <BrowserRouter>
        <AuthInitializer>
          <AppRouter />
        </AuthInitializer>
      </BrowserRouter>
    </Providers>
  );
};

export default App;
