// Simple composable to provide the BlueMap URL from runtime config
// Falls back to environment variable NUXT_PUBLIC_BLUEMAP_URL if present
// Usage: const bluemapUrl = useBluemapUrl()
export const useBluemapUrl = (): string => {
  const runtimeConfig = useRuntimeConfig();
  // Prefer runtimeConfig.public but allow an env override as safety net
  const envUrl = (process?.env?.NUXT_PUBLIC_BLUEMAP_URL as string | undefined);
  return (runtimeConfig.public?.bluemapUrl as string | undefined) || envUrl || 'https://bluemap.onelitefeather.dev/';
};
