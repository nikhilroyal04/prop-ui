import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import Routing from "./routes/route";
import store from "./app/store";
import { Provider } from "react-redux";


const root = createRoot(document.getElementById("root"));

root.render(
  <StrictMode>
    <ChakraProvider>
      <Provider store={store}>
        <BrowserRouter>
          <Routing />
        </BrowserRouter>
      </Provider>
    </ChakraProvider>
  </StrictMode>
);
