import 'obsidian'

declare module 'obsidian' {
  interface App {
    plugins: {
      enabledPlugins: Set<string>
      disablePlugin(id: string): Promise<void>
      enablePlugin(id: string): Promise<void>
      reloadPlugin(id: string): Promise<void>
    }
  }
}
