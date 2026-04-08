// vite.config.ts
import { defineConfig } from "file:///C:/Users/Aditya/OneDrive/Desktop/Celsys/Hivago/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Aditya/OneDrive/Desktop/Celsys/Hivago/node_modules/@vitejs/plugin-react/dist/index.js";
import tailwindcss from "file:///C:/Users/Aditya/OneDrive/Desktop/Celsys/Hivago/node_modules/@tailwindcss/vite/dist/index.mjs";
var postToGetPlugin = () => {
  return {
    name: "post-to-get",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method === "POST" && (req.url?.startsWith("/payment-success") || req.url?.startsWith("/payment-failure"))) {
          req.method = "GET";
        }
        next();
      });
    }
  };
};
var vite_config_default = defineConfig({
  plugins: [react(), tailwindcss(), postToGetPlugin()],
  server: {
    proxy: {
      "/api": {
        target: "https://rally-production-2004.up.railway.app",
        changeOrigin: true,
        rewrite: (path) => path.replace(/api/, "/api")
        // Keep /api prefix as required by backend
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxBZGl0eWFcXFxcT25lRHJpdmVcXFxcRGVza3RvcFxcXFxDZWxzeXNcXFxcSGl2YWdvXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxBZGl0eWFcXFxcT25lRHJpdmVcXFxcRGVza3RvcFxcXFxDZWxzeXNcXFxcSGl2YWdvXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9BZGl0eWEvT25lRHJpdmUvRGVza3RvcC9DZWxzeXMvSGl2YWdvL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcbmltcG9ydCB0YWlsd2luZGNzcyBmcm9tICdAdGFpbHdpbmRjc3Mvdml0ZSdcblxuLy8gVml0ZSBwbHVnaW4gdG8gcmV3cml0ZSBQT1NUIHJlcXVlc3RzIHRvIEdFVCBzbyBSZWFjdCBSb3V0ZXIgY2FuIGhhbmRsZSBwYXltZW50IGdhdGV3YXkgcmVkaXJlY3RzIG5hdGl2ZWx5XG5jb25zdCBwb3N0VG9HZXRQbHVnaW4gPSAoKSA9PiB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogJ3Bvc3QtdG8tZ2V0JyxcbiAgICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyOiBhbnkpIHtcbiAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoKHJlcTogYW55LCByZXM6IGFueSwgbmV4dDogYW55KSA9PiB7XG4gICAgICAgIGlmIChyZXEubWV0aG9kID09PSAnUE9TVCcgJiYgKHJlcS51cmw/LnN0YXJ0c1dpdGgoJy9wYXltZW50LXN1Y2Nlc3MnKSB8fCByZXEudXJsPy5zdGFydHNXaXRoKCcvcGF5bWVudC1mYWlsdXJlJykpKSB7XG4gICAgICAgICAgcmVxLm1ldGhvZCA9ICdHRVQnO1xuICAgICAgICB9XG4gICAgICAgIG5leHQoKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxufVxuXG4vLyBodHRwczovL3ZpdGUuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtyZWFjdCgpLCB0YWlsd2luZGNzcygpLCBwb3N0VG9HZXRQbHVnaW4oKV0sXG4gIHNlcnZlcjoge1xuICAgIHByb3h5OiB7XG4gICAgICAnL2FwaSc6IHtcbiAgICAgICAgdGFyZ2V0OiAnaHR0cHM6Ly9yYWxseS1wcm9kdWN0aW9uLTIwMDQudXAucmFpbHdheS5hcHAnLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL2FwaS8sICcvYXBpJykgLy8gS2VlcCAvYXBpIHByZWZpeCBhcyByZXF1aXJlZCBieSBiYWNrZW5kXG4gICAgICB9XG4gICAgfVxuICB9XG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUEwVSxTQUFTLG9CQUFvQjtBQUN2VyxPQUFPLFdBQVc7QUFDbEIsT0FBTyxpQkFBaUI7QUFHeEIsSUFBTSxrQkFBa0IsTUFBTTtBQUM1QixTQUFPO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixnQkFBZ0IsUUFBYTtBQUMzQixhQUFPLFlBQVksSUFBSSxDQUFDLEtBQVUsS0FBVSxTQUFjO0FBQ3hELFlBQUksSUFBSSxXQUFXLFdBQVcsSUFBSSxLQUFLLFdBQVcsa0JBQWtCLEtBQUssSUFBSSxLQUFLLFdBQVcsa0JBQWtCLElBQUk7QUFDakgsY0FBSSxTQUFTO0FBQUEsUUFDZjtBQUNBLGFBQUs7QUFBQSxNQUNQLENBQUM7QUFBQSxJQUNIO0FBQUEsRUFDRjtBQUNGO0FBR0EsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sR0FBRyxZQUFZLEdBQUcsZ0JBQWdCLENBQUM7QUFBQSxFQUNuRCxRQUFRO0FBQUEsSUFDTixPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUEsUUFDTixRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxTQUFTLENBQUMsU0FBUyxLQUFLLFFBQVEsT0FBTyxNQUFNO0FBQUE7QUFBQSxNQUMvQztBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
