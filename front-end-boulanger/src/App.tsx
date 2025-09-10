import { Provider } from "react-redux";
import { persistor, store } from "@/store/store";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { PersistGate } from "redux-persist/integration/react";
import AppContent from "@/AppContent.tsx";

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<div>Chargement...</div>} persistor={persistor}>
        <ThemeProvider defaultTheme="system" storageKey="bakery-theme">
          <AppContent />
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;
