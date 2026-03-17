import { defineConfig } from "vite";
import react from "./node_modules/@vitejs/plugin-react/dist/index.js";


export default defineConfig({
  plugins: [react()],
});
