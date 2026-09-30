// Configuração do Vite (o "motor" que roda e empacota o projeto).
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // permite usar JSX e o "hot reload" do React

export default defineConfig({
  plugins: [react()],
  server: {
    // host: true deixa o servidor acessível de fora do container.
    // Sem isso, o site não abriria no navegador quando rodar dentro do Docker.
    host: true,
    port: 5173,
  },
});
