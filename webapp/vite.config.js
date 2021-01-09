import vue from "@vitejs/plugin-vue";

export default {
  proxy: {
    "/api": {
      targeT: "http://localhost:3000",
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ""),
    },
  },
  plugins: [vue()],
};
