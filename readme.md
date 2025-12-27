# VICTUS | Ratio Promptuaria

**Victus** é um sistema tático de gerenciamento de estoque de sobrevivência e emergência. Projetado com uma estética "Antiqua" (papel e tinta nanquim), ele foca na funcionalidade pura e no cálculo de autonomia (mêses de sobrevivência) baseado no consumo diário e número de pessoas.

## 🛠️ Funcionalidades
- **Cálculo de Autonomia:** Ajuste global de quantos meses você pretende estocar.
- **Metas Dinâmicas:** Sugestões automáticas baseadas em tabelas de referência.
- **Offline First:** Funciona sem internet através de Service Workers (PWA).
- **Privacidade Total:** Os dados são salvos localmente no navegador (LocalStorage).
- **Backup:** Funções de exportação e importação via arquivos `.json`.

## 📱 Como instalar (APK)
Este projeto é um **PWA (Progressive Web App)**. 
1. Acesse o link do GitHub Pages pelo navegador do celular.
2. Clique nas opções do navegador e selecione **"Adicionar à tela de início"** ou **"Instalar Aplicativo"**.
3. O Victus aparecerá na sua gaveta de apps como um aplicativo nativo.

## 📂 Estrutura do Projeto
- `index.html`: Estrutura da interface.
- `style.css`: Estética Antiqua e design responsivo.
- `app.js`: Lógica de banco de dados e cálculos.
- `manifest.json` & `sw.js`: Configurações de PWA/Instalação.

## ⚖️ Licença
Distribuído sob a licença MIT. Veja `LICENSE` para mais detalhes.
