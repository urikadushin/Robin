# RAYVEN

This is a simple React web app (using Vite) that displays all your `.tsx` Figma design components in a visual gallery. Just put your exported Figma `.tsx` files in `src/components/figma/` and they will appear automatically.

## Getting Started

1. **Install dependencies:**

   ```sh
   npm install
   ```

2. **Add your `.tsx` files:**
   Place your Figma component `.tsx` files in `src/components/figma/`.

3. **Start the app:**

   ```sh
   npm run dev
   ```

   The app will open at [http://localhost:5173](http://localhost:5173)

## Adding More Components

- Just add more `.tsx` files to `src/components/figma/`.
- They will appear in the gallery automatically.

## Notes

- Components must have a default export (the React component).
- If a component requires props, you may need to update the gallery to provide them.

---

Built with [Vite](https://vitejs.dev/) and React.
